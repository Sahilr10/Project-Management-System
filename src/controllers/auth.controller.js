import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/mail.js';
import { emailVerificationMailgenContent } from '../utils/mail.js';

const generateAccessRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, 'Error generating tokens');
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName, role } = req.body;
    
    const existingUser = await User.findOne({
         $or: [{username},{email}] 
    });

    if (existingUser) {
        throw new ApiError(409, 'Username or email already in use');
    }

    const user = await User.create(
        { 
            username,
            fullName, 
            email, 
            password, 
            isEmailVerified: false

        }
    );

    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail(
        {
            email : user?.email,
            subject : "Verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email?token=${unHashedToken}`
            )
        }
    )

    const createdUser = await User.findById(user._id).select("-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry -emailVerificationToken -emailVerificationExpiry");

    if(!createdUser) {
        throw new ApiError(500, 'Error creating user');
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {user: createdUser},
                'User registered successfully. Please verify your email to activate your account.'
            )
        );
});

const login = asyncHandler(async (req, res) => {
    const {email, password, username} = req.body;

    if(!email) {
        throw new ApiError(400, 'Email is required to login');
    }

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404, 'User not found');
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, 'Invalid credentials');
    }
    const {accessToken, refreshToken} = await generateAccessRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry -emailVerificationToken -emailVerificationExpiry");

    const options = {
        httpOnly: true,
        secure: true
        
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser
                },
                "Login successful"
            )
        )

});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, 
        { 
            $set: {
                refreshToken: null
            }
         }, 
        { new: true }
    );
    const options = {
        httpOnly: true,
        secure: true,
    
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "Logout successful"
            )
        );

})

export {
    registerUser,
    generateAccessRefreshTokens,
    login,
    logoutUser
};
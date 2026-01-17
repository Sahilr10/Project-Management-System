import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from 'jsonwebtoken'

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || require.headers('Authorization')?.replace('Bearer ', '')

    if(!token) {
        return next(new ApiError(401, 'Authentication token is missing'))
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken.id).select("-password -emailVerificationToken -emailVerificationExpiry")

        if(!user) {
            return next(new ApiError(401, 'Invalid access token'))
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, 'Invalid access token')
    }
})
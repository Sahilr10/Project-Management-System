import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ProjectMember } from "../models/projectMember.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        require.headers("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return next(new ApiError(401, "Authentication token is missing"));
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken.id).select(
            "-password -emailVerificationToken -emailVerificationExpiry",
        );

        if (!user) {
            return next(new ApiError(401, "Invalid access token"));
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid access token");
    }
});

export const validateProjectPermission = (roles = []) => {
    asyncHandler(async (req, res, next) => {
        const { projectId } = req.params;

        if (!projectId) {
            return next(new ApiError(400, "Project ID is required"));
        }

        const project = await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id),
        });

        if (!project) {
            return next(
                new ApiError(403, "You do not have access to this project"),
            );
        }

        const givenRole = project?.role;

        req.user.role = givenRole;

        if (!roles.includes(givenRole)) {
            return next(
                new ApiError(403, "You do not have the required permissions"),
            );
        }

        next();
    });
};

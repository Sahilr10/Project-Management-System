import { Router } from "express";
import {
    getProject,
    createProject,
    updateProject,
    deleteProject,
    addMembersToProject,
    updateMemberRole,
    deleteMember,
    getProjectById,
    getProjectMembers,
} from "../controllers/project.controller.js";
import {
    addMemberToProjectValidator,
    createProjectValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    verifyJWT,
    validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/")
    .get(getProject)
    .post(createProjectValidator(), validate, createProject);

router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRoles), getProjectById)
    .put(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        createProjectValidator(),
        validate,
        updateProject,
    )
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject);

router
    .route("/:projectId/members")
    .get(validateProjectPermission(AvailableUserRoles), getProjectMembers)
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        addMemberToProjectValidator(),
        validate,
        addMembersToProject,
    );

router
    .route("/:projectId/members/:userId")
    .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteMember);

export default router;

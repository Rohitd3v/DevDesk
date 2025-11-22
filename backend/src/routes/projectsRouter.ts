import { Router } from "express"
import authMiddleware from "../middleware/Authmiddleware.js";
import { getprojectbyUser, getProjectsbyId, creatProject, updateProject, deleteProject } from "../controllers/projectController.js";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middleware/validateRequest.js";
import { createProjectSchema, updateProjectSchema } from "../validators/zodValidation.js";

const router = Router();

router.get('/', authMiddleware, asyncHandler(getprojectbyUser))
router.get('/:P_id', authMiddleware, asyncHandler(getProjectsbyId))
router.post('/', authMiddleware, validate({ body: createProjectSchema }), asyncHandler(creatProject))
router.patch('/:P_id', authMiddleware, validate({ body: updateProjectSchema }), asyncHandler(updateProject))
router.delete('/:P_id', authMiddleware, asyncHandler(deleteProject))

export default router;

import express, { Router } from "express";
import authMiddleware from "../middleware/Authmiddleware.ts";
import { getprojectbyUser, getProjectsbyId, creatProject, updateProject, deleteProject } from "../controllers/projectController.ts";
import asyncHandler from "../utils/asyncHandler.ts";
import validate from "../middleware/validateRequest.ts";
import { createProjectSchema, updateProjectSchema } from "../validators/zodValidation.ts";

const router = express.Router();

router.get('/', authMiddleware, asyncHandler(getprojectbyUser))
router.get('/:P_id', authMiddleware, asyncHandler(getProjectsbyId))
router.post('/', authMiddleware, validate({ body: createProjectSchema }), asyncHandler(creatProject))
router.patch('/:P_id', authMiddleware, validate({ body: updateProjectSchema }), asyncHandler(updateProject))
router.delete('/:P_id', authMiddleware, asyncHandler(deleteProject))

export default router;

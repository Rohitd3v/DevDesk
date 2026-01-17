import express, { Router } from "express";
import authMiddleware from "../middleware/Authmiddleware.ts";
import { getprojectbyUser, getProjectsbyId, creatProject, updateProject, deleteProject } from "../controllers/projectController.ts";
import asyncHandler from "../utils/asyncHandler.ts";
import validate from "../middleware/validateRequest.ts";
import { createProjectSchema, updateProjectSchema, projectParamsSchema } from "../validators/zodValidation.ts";

const router = express.Router();

router.get('/', authMiddleware, asyncHandler(getprojectbyUser))
router.get('/:project_id', authMiddleware, validate({ params: projectParamsSchema }), asyncHandler(getProjectsbyId))
router.post('/', authMiddleware, validate({ body: createProjectSchema }), asyncHandler(creatProject))
router.patch('/:project_id', authMiddleware, validate({ params: projectParamsSchema, body: updateProjectSchema }), asyncHandler(updateProject))
router.delete('/:project_id', authMiddleware, validate({ params: projectParamsSchema }), asyncHandler(deleteProject))

export default router;

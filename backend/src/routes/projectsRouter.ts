import express, { Router } from "express";
import authMiddleware from "../middleware/Authmiddleware.js";
import { getprojectbyUser, getProjectsbyId, creatProject, updateProject, deleteProject } from "../controllers/projectController.js";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middleware/validateRequest.js";
import { createProjectSchema, updateProjectSchema, projectParamsSchema } from "../validators/zodValidation.js";

const router = express.Router();

router.get('/', authMiddleware, asyncHandler(getprojectbyUser))
router.get('/:project_id', authMiddleware, validate({ params: projectParamsSchema }), asyncHandler(getProjectsbyId))
router.post('/', authMiddleware, validate({ body: createProjectSchema }), asyncHandler(creatProject))
router.patch('/:project_id', authMiddleware, validate({ params: projectParamsSchema, body: updateProjectSchema }), asyncHandler(updateProject))
router.delete('/:project_id', authMiddleware, validate({ params: projectParamsSchema }), asyncHandler(deleteProject))

export default router;

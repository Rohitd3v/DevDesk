import { Router } from "express"
import authMiddleware from "../middleware/Authmiddleware.js";
import { getprojectbyUser, getProjectsbyId, creatProject, updateProject, deleteProject } from "../controllers/projectController.js";
import asyncHandler from "../utils/asyncHandler.js";
const router = Router();

router.get('/', authMiddleware, asyncHandler(getprojectbyUser))
router.get('/:P_id', authMiddleware, asyncHandler(getProjectsbyId))
router.post('/', authMiddleware, asyncHandler(creatProject))
router.patch('/:P_id', authMiddleware, asyncHandler(updateProject))
router.delete('/:P_id', authMiddleware, asyncHandler(deleteProject))

export default router;

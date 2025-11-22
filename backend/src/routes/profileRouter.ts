import { Router } from "express";
import { CreateProfile, getProfile, getProfilebyId, updateProfie, deleteProfile } from "../controllers/profileController.js";
import Authmiddleware from "../middleware/Authmiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post('/', Authmiddleware, asyncHandler(CreateProfile))
router.get('/', asyncHandler(getProfile))
router.get('/:id', Authmiddleware, asyncHandler(getProfilebyId));
router.patch('/:id', Authmiddleware, asyncHandler(updateProfie));
router.delete('/:id', Authmiddleware, asyncHandler(deleteProfile))


export default router;


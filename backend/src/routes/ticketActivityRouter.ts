import express, { Router } from "express";
import { createactivity, getActivitiesbytId, getAllActivitiesByuser, DelActivitybyId } from "../controllers/ticketActivityController.ts";
import authMiddleware from "../middleware/Authmiddleware.ts";
import validate from "../middleware/validateRequest.ts";
import { createActivitySchema, ticketParamsSchema, activityParamsSchema } from "../validators/zodValidation.ts";
import asyncHandler from "../utils/asyncHandler.ts";

const router = express.Router();

router.post('/:ticket_id', authMiddleware, validate({ params: ticketParamsSchema, body: createActivitySchema }), asyncHandler(createactivity));
router.get('/:ticket_id', authMiddleware, validate({ params: ticketParamsSchema }), asyncHandler(getActivitiesbytId));
router.get('/user/:ticket_id', authMiddleware, validate({ params: ticketParamsSchema }), asyncHandler(getAllActivitiesByuser));
router.delete('/:ticket_id/:activity_id', authMiddleware, validate({ params: activityParamsSchema }), asyncHandler(DelActivitybyId));

export default router;

import { Router } from "express";
import { createactivity, getActivitiesbytId, getAllActivitiesByuser, DelActivitybyId } from "../controllers/ticketActivityController.js";
import authMiddleware from "../middleware/Authmiddleware.js";
import validate from "../middleware/validateRequest.js";
import { createActivitySchema, ticketParamsSchema, activityParamsSchema } from "../validators/zodValidation.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post('/:ticket_id', authMiddleware, validate({ params: ticketParamsSchema, body: createActivitySchema }), asyncHandler(createactivity));
router.get('/:ticket_id', authMiddleware, validate({ params: ticketParamsSchema }), asyncHandler(getActivitiesbytId));
router.get('/user/:ticket_id', authMiddleware, validate({ params: ticketParamsSchema }), asyncHandler(getAllActivitiesByuser));
router.delete('/:ticket_id/:activity_id', authMiddleware, validate({ params: activityParamsSchema }), asyncHandler(DelActivitybyId));

export default router;

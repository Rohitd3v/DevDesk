import { Router } from "express";
import authMiddleware from "../middleware/Authmiddleware.js";
import { createComment, getcommentbyticketId, getallCommentbyUserId, DeleteCommentbyId, } from "../controllers/ticketCommentController.js";
import validate from "../middleware/validateRequest.js";
import { createCommentSchema, ticketParamsSchema, commentParamsSchema } from "../validators/zodValidation.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post('/:ticket_id', authMiddleware, validate({ params: ticketParamsSchema, body: createCommentSchema }), asyncHandler(createComment));
router.get('/:ticket_id', authMiddleware, validate({ params: ticketParamsSchema }), asyncHandler(getcommentbyticketId));
router.get('/:ticket_id/user', authMiddleware, validate({ params: ticketParamsSchema }), asyncHandler(getallCommentbyUserId));
router.delete('/:ticket_id/:comment_id', authMiddleware, validate({ params: commentParamsSchema }), asyncHandler(DeleteCommentbyId));

export default router;

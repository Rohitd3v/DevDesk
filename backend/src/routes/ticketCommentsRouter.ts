import express, { Router } from "express";
import authMiddleware from "../middleware/Authmiddleware.ts";
import { createComment, getcommentbyticketId, getallCommentbyUserId, DeleteCommentbyId, } from "../controllers/ticketCommentController.ts";
import validate from "../middleware/validateRequest.ts";
import { createCommentSchema, ticketParamsSchema, commentParamsSchema } from "../validators/zodValidation.ts";
import asyncHandler from "../utils/asyncHandler.ts";

const router = express.Router();

router.post('/:ticket_id', authMiddleware, validate({ params: ticketParamsSchema, body: createCommentSchema }), asyncHandler(createComment));
router.get('/:ticket_id', authMiddleware, validate({ params: ticketParamsSchema }), asyncHandler(getcommentbyticketId));
router.get('/:ticket_id/user', authMiddleware, validate({ params: ticketParamsSchema }), asyncHandler(getallCommentbyUserId));
router.delete('/:ticket_id/:comment_id', authMiddleware, validate({ params: commentParamsSchema }), asyncHandler(DeleteCommentbyId));

export default router;

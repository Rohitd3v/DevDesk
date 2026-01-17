import express, { Router } from "express";
import { TicketController } from "../controllers/ticketController.js";
import authMiddleware from "../middleware/Authmiddleware.js";
import validate from "../middleware/validateRequest.js";
import { createTicketSchema, updateTicketSchema, ticketParamsSchema, projectParamsSchema } from "../validators/zodValidation.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post(
  "/:project_id/tickets",
  authMiddleware,
  validate({ params: projectParamsSchema, body: createTicketSchema }),
  asyncHandler(TicketController.create),
);
router.get("/:project_id/tickets", authMiddleware, validate({ params: projectParamsSchema }), asyncHandler(TicketController.getAll));
router.get("/:ticket_id", authMiddleware, validate({ params: ticketParamsSchema }), asyncHandler(TicketController.getOne));
router.patch(
  "/:ticket_id",
  authMiddleware,
  validate({ params: ticketParamsSchema, body: updateTicketSchema }),
  asyncHandler(TicketController.update),
);
router.delete("/:ticket_id", authMiddleware, validate({ params: ticketParamsSchema }), asyncHandler(TicketController.remove));
router.get("/", authMiddleware, asyncHandler(TicketController.getAllTicketbyUserId));

export default router;

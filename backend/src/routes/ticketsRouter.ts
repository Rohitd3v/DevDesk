import express, { Router } from "express";
import { TicketController } from "../controllers/ticketController.ts";
import authMiddleware from "../middleware/Authmiddleware.ts";
import validate from "../middleware/validateRequest.ts";
import { createTicketSchema, updateTicketSchema } from "../validators/zodValidation.ts";
import asyncHandler from "../utils/asyncHandler.ts";

const router = express.Router();

router.post(
  "/:project_id/tickets",
  authMiddleware,
  validate({ body: createTicketSchema }),
  asyncHandler(TicketController.create),
);
router.get("/:project_id/tickets", authMiddleware, asyncHandler(TicketController.getAll));
router.get("/:ticket_id", authMiddleware, asyncHandler(TicketController.getOne));
router.patch(
  "/:ticket_id",
  authMiddleware,
  validate({ body: updateTicketSchema }),
  asyncHandler(TicketController.update),
);
router.delete("/:ticket_id", authMiddleware, asyncHandler(TicketController.remove));
router.get("/", authMiddleware, asyncHandler(TicketController.getAllTicketbyUserId));

export default router;

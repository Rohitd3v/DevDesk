import { Router } from "express";
import { TicketController } from "../controllers/ticketController.js";
import authMiddleware from "../middleware/Authmiddleware.js";
import validate from "../middleware/validateRequest.js";
import { createTicketSchema, updateTicketSchema } from "../validators/zodValidation.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

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

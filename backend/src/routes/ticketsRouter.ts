import { Router } from "express";
import { TicketController } from "../controllers/ticketController.js";
import authMiddleware from "../middleware/Authmiddleware.js";
import {
  validateTicketData,
  validateTicketUpdate,
} from "../middleware/validateTicket.js";

const router = Router();

router.post(
  "/:project_id/tickets",
  authMiddleware,
  validateTicketData,
  TicketController.create,
);
router.get("/:project_id/tickets", authMiddleware, TicketController.getAll);
router.get("/:ticket_id", authMiddleware, TicketController.getOne);
router.patch(
  "/:ticket_id",
  authMiddleware,
  validateTicketUpdate,
  TicketController.update,
);
router.delete("/:ticket_id", authMiddleware, TicketController.remove);
router.get("/", authMiddleware, TicketController.getAllTicketbyUserId);

export default router;

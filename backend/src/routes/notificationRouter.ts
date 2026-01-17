import { Router } from "express";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../controllers/notificationController.js";
import authMiddleware from "../middleware/Authmiddleware.js";

const router = Router();

router.get("/", authMiddleware, getNotifications);
router.put("/:notificationId/read", authMiddleware, markNotificationAsRead);
router.put("/read/all", authMiddleware, markAllNotificationsAsRead);

export default router;

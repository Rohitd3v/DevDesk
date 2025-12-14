import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.ts";
import { NotificationService } from "../services/notificationService.ts";
import type { AuthenticatedRequest } from "../types/AuthenticatedRequest.ts";
import { sendResponse } from "../utils/sendResponse.ts";

export const getNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return sendResponse(res, 401, false, { message: "Unauthorized" });
  }

  const { data, error } = await NotificationService.getNotificationsByUser(userId);

  if (error) {
    return sendResponse(res, 500, false, { message: error.message });
  }

  sendResponse(res, 200, true, { data, message: "Notifications retrieved successfully" });
});

export const markNotificationAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { notificationId } = req.params;

  if (!userId) {
    return sendResponse(res, 401, false, { message: "Unauthorized" });
  }

  if (!notificationId) {
    return sendResponse(res, 400, false, { message: "Notification ID is required" });
  }
  const { data, error } = await NotificationService.markAsRead(notificationId, userId);

  if (error) {
    return sendResponse(res, 500, false, { message: error.message });
  }

  sendResponse(res, 200, true, { data, message: "Notification marked as read" });
});

export const markAllNotificationsAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendResponse(res, 401, false, { message: "Unauthorized" });
  }

  const { data, error } = await NotificationService.markAllAsRead(userId);

  if (error) {
    return sendResponse(res, 500, false, { message: error.message });
  }

  sendResponse(res, 200, true, { data, message: "All notifications marked as read" });
});

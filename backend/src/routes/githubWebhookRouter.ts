import express from "express";
import { handleWebhook } from "../controllers/githubWebhookController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

// Webhook endpoint
// Note: verify signature logic is inside the controller or should be middleware
router.post("/events", asyncHandler(handleWebhook));

export default router;

import { z } from "zod";
import { STATUS, PRIORITY } from "../types/ticketTypes.js";

export const signUpSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const createTicketSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  status: z.enum(STATUS).optional(),
  priority: z.enum(PRIORITY).optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(STATUS).optional(),
  priority: z.enum(PRIORITY).optional(),
  assigned_to: z.string().uuid().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided to update",
});

export const createProjectSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
  description: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
  description: z.string().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, { message: "Comment is required" }),
});

export const ticketParamsSchema = z.object({
  ticket_id: z.string().uuid({ message: "Invalid ticket ID" }),
});

export const commentParamsSchema = z.object({
  ticket_id: z.string().uuid({ message: "Invalid ticket ID" }),
  comment_id: z.string().uuid({ message: "Invalid comment ID" }),
});

export const createActivitySchema = z.object({
  action: z.string().min(1, { message: "Action is required" }),
  details: z.string().optional(),
});

export const activityParamsSchema = z.object({
  ticket_id: z.string().uuid({ message: "Invalid ticket ID" }),
  activity_id: z.string().uuid({ message: "Invalid activity ID" }),
});

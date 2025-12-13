import { z } from "zod";

// Schema for linking a repository to a project
export const linkRepoSchema = z.object({
  repo_owner: z.string().min(1, { message: "Repository owner is required" }),
  repo_name: z.string().min(1, { message: "Repository name is required" }),
  github_repo_id: z.number().int().positive({ message: "Valid GitHub repository ID is required" }),
});

// Schema for project parameters
export const projectParamsSchema = z.object({
  project_id: z.string().uuid({ message: "Valid project ID is required" }),
});

// Schema for repository parameters
export const repoParamsSchema = z.object({
  project_id: z.string().uuid({ message: "Valid project ID is required" }),
  repo_id: z.string().uuid({ message: "Valid repository ID is required" }),
});

// Schema for GitHub webhook payload validation
export const webhookPayloadSchema = z.object({
  action: z.string(),
  issue: z.object({
    id: z.number(),
    number: z.number(),
    title: z.string(),
    body: z.string().nullable(),
    state: z.enum(["open", "closed"]),
    html_url: z.string().url(),
    user: z.object({
      login: z.string(),
      id: z.number(),
    }),
    created_at: z.string(),
    updated_at: z.string(),
    labels: z.array(z.object({
      name: z.string(),
      color: z.string(),
    })).optional(),
  }).optional(),
  repository: z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    owner: z.object({
      login: z.string(),
      id: z.number(),
    }),
  }),
});

// Schema for creating GitHub issue from ticket
export const createIssueSchema = z.object({
  title: z.string().min(1, { message: "Issue title is required" }),
  body: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

// Schema for updating GitHub issue
export const updateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().optional(),
  state: z.enum(["open", "closed"]).optional(),
  labels: z.array(z.string()).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided to update",
});
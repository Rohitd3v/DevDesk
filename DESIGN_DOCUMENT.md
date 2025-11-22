# DevDesk: Architecture and Feature Implementation Plan

## 1. Introduction

DevDesk is a web-based issue tracking and project management application designed to streamline development workflows. It provides features for managing projects, tracking tickets (issues), and collaborating through comments. This document outlines the current architecture, provides recommendations for improvements, and details a plan for implementing significant new features, including GitHub integration, AI-powered enhancements, and real-time notifications.

## 2. Current Architecture Overview

The application is a monorepo composed of a Next.js frontend and a Node.js/Express backend, using Supabase as the database and authentication provider.

### 2.1. Backend (Express.js)

- **Structure:** The backend follows a standard Model-View-Controller (MVC)-like pattern, organized into `routes`, `controllers`, `services`, and `middleware`.
- **API:** A RESTful API is exposed with versioning (`/api/v1`).
- **Database:** It connects to a Supabase (PostgreSQL) database. The Supabase client is used for database operations.
- **Authentication:** JWT-based authentication is handled by a dedicated middleware (`Authmiddleware.ts`) that validates a bearer token against the Supabase `auth.getUser` method on nearly every route.

### 2.2. Frontend (Next.js)

- **Framework:** The frontend is built with Next.js using the App Router.
- **Structure:** Code is organized by feature within the `src/app/features` directory (e.g., `auth`, `projects`, `tickets`). Each feature contains its own `components`, `hooks`, and `services`.
- **State Management:** Component state and remote data fetching are managed via custom hooks (e.g., `useProjects`, `useTickets`).
- **API Communication:** A central `apiClient.ts` likely handles requests to the backend API.

## 3. Architectural Analysis & Recommendations

The initial codebase investigation revealed several architectural inconsistencies that should be addressed to improve maintainability, scalability, and developer experience.

### 3.1. Inconsistent Data Access
- **Observation:** Some controllers (`ticketCommentController.ts`) interact directly with the Supabase client, while others (`ticketController.ts`) use a dedicated service layer (`ticketService.ts`).
- **Recommendation:** **Standardize on a Service Layer.** All database interactions must be encapsulated within a service module (e.g., `projectService.ts`, `commentService.ts`). Controllers should never access the database directly. This centralizes data logic, improves reusability, and makes the codebase easier to test and maintain.

### 3.2. Inconsistent Request Validation
- **Observation:** Some routes use Zod for validation (`authRouter.ts`), while others rely on custom, manual validation middleware (`validateTicket.ts`).
- **Recommendation:** **Standardize on Zod.** Adopt Zod for all incoming request validation. It provides a declarative, type-safe, and powerful way to define and enforce data schemas, reducing boilerplate and potential errors. The `validateTicket.ts` middleware should be refactored to use Zod schemas.

### 3.3. Ambiguous API Routes
- **Observation:** Some routes have ambiguous names, such as the `GET` route at `/:ticket_id/user` in `ticketCommentsRouter.ts`.
- **Recommendation:** **Adopt a Clear and Consistent Routing Convention.** Routes should be predictable and clearly represent the resource they are acting upon. For example, a route to get comments for a ticket should be `GET /tickets/:ticket_id/comments`. The ambiguous route should be renamed or removed.

## 4. Proposed New Features & Implementation

### 4.1. Data Model Extensions

To support the new features, the following new database tables are proposed:

| Table Name              | Columns                                                                   | Description                                                                 |
| ----------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `github_linked_repos`   | `id`, `project_id` (FK to `projects`), `repo_name`, `repo_owner`, `github_repo_id` | Links a DevDesk project to a specific GitHub repository.                    |
| `github_synced_issues`  | `id`, `ticket_id` (FK to `tickets`), `github_issue_id`, `github_issue_number` | Maps a DevDesk ticket to a synced GitHub issue.                             |
| `ai_ticket_summaries`   | `id`, `ticket_id` (FK to `tickets`), `summary_text`, `model_version`, `created_at` | Stores AI-generated summaries for tickets.                                  |
| `ai_suggested_tags`     | `id`, `ticket_id` (FK to `tickets`), `tag_name`, `confidence_score`         | Stores AI-suggested tags for a ticket.                                      |
| `user_github_tokens`    | `user_id` (FK to `users`), `access_token`, `refresh_token`                  | Securely stores OAuth tokens for users who log in with GitHub.              |

---

### 4.2. GitHub Integration Plan

#### 1. GitHub OAuth Login
- **Backend:**
    - Add `passport` and `passport-github2` libraries.
    - Create a new `auth/github` route to initiate the OAuth flow.
    - Create a `auth/github/callback` route to handle the response, retrieve user profile, create a DevDesk user if one doesn't exist, and issue a JWT.
    - Store the GitHub access token in the new `user_github_tokens` table.
- **Frontend:**
    - Add a "Login with GitHub" button on the Login and Signup pages.

#### 2. Link Repositories & Sync Issues (Two-Way)
- **Backend:**
    - **API:** Create new CRUD endpoints under `/projects/:id/github` for linking/unlinking repositories.
    - **Webhooks:** Create a new `/webhooks/github` endpoint to receive events from GitHub (e.g., `issues.opened`, `issues.edited`, `issues.closed`).
    - **Service Logic:** Create a `githubService.ts` to handle the logic of creating/updating DevDesk tickets based on webhook payloads. When a ticket is updated in DevDesk, use the stored user OAuth token and the GitHub API to update the corresponding issue.
- **Frontend:**
    - Create a settings area on the project page to manage linked repositories.
    - Display a GitHub icon/link on tickets that are synced with a GitHub issue.

---

### 4.3. AI-Powered Features Plan

#### 1. AI Ticket Summarization
- **Backend:**
    - Add a library for an AI provider (e.g., `openai`).
    - Create a new `aiService.ts`.
    - Implement a function `summarizeTicket(ticketId)` that fetches ticket details and comments, formats them into a prompt, and sends it to the AI model.
    - Create a new API endpoint `POST /tickets/:id/summarize` that calls this service and stores the result in `ai_ticket_summaries`.
- **Frontend:**
    - Add a "Generate Summary" button on the ticket details page.
    - Display the summary in a prominent position when available.

#### 2. Automated Ticket Tagging
- **Backend:**
    - In `aiService.ts`, create a function `suggestTags(ticketTitle, ticketDescription)`.
    - In `ticketService.ts`, after a new ticket is created, asynchronously call `aiService.suggestTags`.
    - Store the suggestions in the `ai_suggested_tags` table.
- **Frontend:**
    - On the ticket details page, display the suggested tags and allow a user to accept or dismiss them with a single click.

---

### 4.4. Other Integrations: Real-time Notifications

#### 1. Slack/Discord Integration
- **Backend:**
    - Create a `notificationService.ts`.
    - Add functions like `sendSlackNotification(webhookUrl, message)`.
    - In the services (`ticketService`, `commentService`), call the notification service on key events (e.g., `ticketService.createTicket`, `commentService.createComment`).
- **Configuration:** Project settings will need a field to store the incoming webhook URL for a Slack/Discord channel.

## 5. High-Level Implementation Roadmap

This project can be broken down into four distinct phases:

- **Phase 1: Architecture Refactoring (Recommended First Step)**
    - **Goal:** Stabilize the existing codebase and establish clear patterns.
    - **Tasks:**
        1. Refactor all controllers to use a service layer for data access.
        2. Replace all manual validation with Zod schemas.
        3. Audit and clean up all API routes for consistency.
        4. Add corresponding tests for the new services.

- **Phase 2: GitHub Integration**
    - **Goal:** Connect DevDesk to GitHub for authentication and issue management.
    - **Tasks:**
        1. Implement GitHub OAuth.
        2. Build the repository linking feature.
        3. Implement the GitHub webhook handler and two-way issue synchronization logic.

- **Phase 3: AI Feature Implementation**
    - **Goal:** Enhance the user experience with intelligent features.
    - **Tasks:**
        1. Implement the ticket summarization feature.
        2. Implement the automated tag suggestion feature.

- **Phase 4: Notifications**
    - **Goal:** Add real-time communication with external services.
    - **Tasks:**
        1. Implement the notification service.
        2. Integrate notifications into the existing services.
        3. Add UI for configuring notification webhooks.

This phased approach allows for incremental development and delivery of value, starting with a crucial cleanup phase that will accelerate all future development.

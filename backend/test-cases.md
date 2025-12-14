# Test Cases

## GitHub Auth API (`githubAuth.test.ts`)

- **GET /api/v1/auth/github**
  - should initiate GitHub OAuth (public route)
- **GET /api/v1/auth/github/callback**
  - should handle GitHub OAuth callback (public route)
  - should handle callback without code parameter
- **GET /api/v1/auth/github/error**
  - should handle GitHub OAuth errors (public route)
- **POST /api/v1/auth/github/link**
  - should link GitHub account with valid auth
  - should reject link request without auth token
- **DELETE /api/v1/auth/github/unlink**
  - should unlink GitHub account with valid auth
  - should reject unlink request without auth token

## Ticket Activity API (`ticketActivity.test.ts`)

- **POST /api/v1/ticketAction/:ticket_id**
  - should create activity with valid data and auth
  - should reject activity creation without auth token
  - should reject activity creation with missing action
  - should reject activity creation with empty action
  - should reject activity creation with invalid ticket_id UUID
  - should accept activity with optional details
- **GET /api/v1/ticketAction/:ticket_id**
  - should get activities by ticket ID with valid auth
  - should reject request without auth token
  - should reject request with invalid ticket_id UUID
- **GET /api/v1/ticketAction/user/:ticket_id**
  - should get activities by user with valid auth
  - should reject request without auth token
- **DELETE /api/v1/ticketAction/:ticket_id/:activity_id**
  - should delete activity with valid auth
  - should reject delete without auth token
  - should reject delete with invalid ticket_id UUID
  - should reject delete with invalid activity_id UUID

## Ticket Comment API (`ticketComment.test.ts`)

- **POST /api/v1/ticketcomment/:ticket_id**
  - should create comment with valid data and auth
  - should reject comment creation without auth token
  - should reject comment creation with missing content
  - should reject comment creation with empty content
  - should reject comment creation with invalid ticket_id UUID
- **GET /api/v1/ticketcomment/:ticket_id**
  - should get comments by ticket ID with valid auth
  - should reject request without auth token
  - should reject request with invalid ticket_id UUID
- **GET /api/v1/ticketcomment/:ticket_id/user**
  - should get comments by user with valid auth
  - should reject request without auth token
- **DELETE /api/v1/ticketcomment/:ticket_id/:comment_id**
  - should delete comment with valid auth
  - should reject delete without auth token
  - should reject delete with invalid ticket_id UUID
  - should reject delete with invalid comment_id UUID

## Ticket API (`ticket.test.ts`)

- **POST /api/v1/ticket/:project_id/tickets**
  - should create ticket with valid data and auth
  - should reject ticket creation without auth token
  - should reject ticket creation with missing title
  - should reject ticket creation with missing description
  - should reject ticket creation with invalid status
  - should reject ticket creation with invalid priority
  - should accept valid status values
  - should accept valid priority values
- **GET /api/v1/ticket/:project_id/tickets**
  - should get tickets by project with valid auth
  - should reject request without auth token
- **GET /api/v1/ticket/:ticket_id**
  - should get ticket by ID with valid auth
  - should reject request without auth token
- **GET /api/v1/ticket**
  - should get all tickets by user ID with valid auth
  - should reject request without auth token
- **PATCH /api/v1/ticket/:ticket_id**
  - should update ticket with valid data and auth
  - should reject update without auth token
  - should reject update with empty body
  - should reject update with invalid status
  - should reject update with invalid UUID for assigned_to
- **DELETE /api/v1/ticket/:ticket_id**
  - should delete ticket with valid auth
  - should reject delete without auth token

## Project API (`project.test.ts`)

- **GET /api/v1/projects**
  - should get user projects with valid auth
  - should reject request without auth token
- **GET /api/v1/projects/:P_id**
  - should get project by ID with valid auth
  - should reject request without auth token
- **POST /api/v1/projects**
  - should create project with valid data and auth
  - should reject project creation without auth token
  - should reject project creation with missing name
  - should reject project creation with empty name
- **PATCH /api/v1/projects/:P_id**
  - should update project with valid data and auth
  - should reject update without auth token
  - should reject update with empty name
- **DELETE /api/v1/projects/:P_id**
  - should delete project with valid auth
  - should reject delete without auth token

## GitHub Repo API (`githubRepo.test.ts`)

- **GET /api/v1/github/connection**
  - should get GitHub connection status with valid auth
  - should reject request without auth token
- **GET /api/v1/github/repositories**
  - should get user repositories with valid auth
  - should reject request without auth token
- **GET /api/v1/github/projects/:project_id/repositories**
  - should get linked repositories for project with valid auth
  - should reject request without auth token
  - should reject request with invalid project_id UUID
- **POST /api/v1/github/projects/:project_id/repositories**
  - should link repository to project with valid data and auth
  - should reject link request without auth token
  - should reject link request with missing repo_owner
  - should reject link request with missing repo_name
  - should reject link request with invalid github_repo_id
  - should reject link request with invalid project_id UUID
- **DELETE /api/v1/github/projects/:project_id/repositories/:repo_id**
  - should unlink repository from project with valid auth
  - should reject unlink request without auth token
  - should reject unlink request with invalid project_id UUID
  - should reject unlink request with invalid repo_id UUID

## Auth API (`auth.test.ts`)

- **POST /api/v1/auth/signup**
  - should sign up a new user with valid data
  - should reject signup with invalid email
  - should reject signup with password less than 6 characters
  - should reject signup with missing email
  - should reject signup with missing password
  - should handle signup errors from Supabase
- **POST /api/v1/auth/login**
  - should login with valid credentials
  - should reject login with invalid email format
  - should reject login with missing email
  - should reject login with missing password
  - should handle login errors from Supabase

## Profile API (`profile.test.ts`)

- **POST /api/v1/profiles**
  - should create a profile with valid data and auth
  - should reject profile creation without auth token
  - should reject profile creation with missing username
  - should reject profile creation if profile already exists
- **GET /api/v1/profiles**
  - should get all profiles (public route)
- **GET /api/v1/profiles/:id**
  - should get profile by ID with valid auth
  - should reject request without auth token
  - should return 404 for non-existent profile
- **PATCH /api/v1/profiles/:id**
  - should update profile with valid data and auth
  - should reject update without auth token
- **DELETE /api/v1/profiles/:id**
  - should delete profile with valid auth
  - should reject delete without auth token

## Notification API (`notification.test.ts`)

- **GET /api/v1/notifications**
  - should get notifications with valid auth
  - should reject request without auth token
  - should return empty array when no notifications exist
- **PUT /api/v1/notifications/:notificationId/read**
  - should mark notification as read with valid auth
  - should reject request without auth token
  - should handle non-existent notification
- **PUT /api/v1/notifications/read/all**
  - should mark all notifications as read with valid auth
  - should reject request without auth token
  - should handle when no unread notifications exist

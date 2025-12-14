-- ============================================================================
-- DevDesk Complete Database Schema Migration
-- ============================================================================
-- This migration creates all tables, indexes, RLS policies, and functions
-- required for the DevDesk application.
-- ============================================================================

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'developer' CHECK (role IN ('developer', 'manager', 'admin')),
    suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket activity log table
CREATE TABLE IF NOT EXISTS ticket_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    channel TEXT DEFAULT 'in_app' CHECK (channel IN ('in_app', 'slack', 'discord', 'email')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- GITHUB INTEGRATION TABLES
-- ============================================================================

-- Table to store GitHub OAuth tokens for users
CREATE TABLE IF NOT EXISTS user_github_tokens (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    github_username TEXT,
    github_user_id INTEGER,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to link DevDesk projects to GitHub repositories
CREATE TABLE IF NOT EXISTS github_linked_repos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    repo_name TEXT NOT NULL,
    repo_owner TEXT NOT NULL,
    github_repo_id INTEGER NOT NULL,
    full_name TEXT NOT NULL, -- owner/repo format
    clone_url TEXT,
    html_url TEXT,
    default_branch TEXT DEFAULT 'main',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, github_repo_id)
);

-- Table to map DevDesk tickets to GitHub issues (two-way sync)
CREATE TABLE IF NOT EXISTS github_synced_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    github_issue_id INTEGER NOT NULL,
    github_issue_number INTEGER NOT NULL,
    repo_id UUID NOT NULL REFERENCES github_linked_repos(id) ON DELETE CASCADE,
    sync_direction TEXT CHECK (sync_direction IN ('devdesk_to_github', 'github_to_devdesk', 'bidirectional')) DEFAULT 'bidirectional',
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ticket_id),
    UNIQUE(repo_id, github_issue_number)
);

-- Table to store webhook events for debugging and processing
CREATE TABLE IF NOT EXISTS github_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    action TEXT,
    repository_id INTEGER,
    issue_number INTEGER,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_tickets_project_id ON tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_author_id ON ticket_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_ticket_activity_ticket_id ON ticket_activity(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_activity_actor_id ON ticket_activity(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- GitHub integration indexes
CREATE INDEX IF NOT EXISTS idx_github_tokens_user_id ON user_github_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_github_repos_project_id ON github_linked_repos(project_id);
CREATE INDEX IF NOT EXISTS idx_github_repos_repo_id ON github_linked_repos(github_repo_id);
CREATE INDEX IF NOT EXISTS idx_synced_issues_ticket_id ON github_synced_issues(ticket_id);
CREATE INDEX IF NOT EXISTS idx_synced_issues_github_issue ON github_synced_issues(github_issue_id);
CREATE INDEX IF NOT EXISTS idx_synced_issues_repo_id ON github_synced_issues(repo_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON github_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_repo_id ON github_webhook_events(repository_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on GitHub integration tables
ALTER TABLE user_github_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_linked_repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_synced_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_webhook_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can manage their own GitHub tokens" ON user_github_tokens;
DROP POLICY IF EXISTS "Users can manage repos for their projects" ON github_linked_repos;
DROP POLICY IF EXISTS "Users can access synced issues for their tickets" ON github_synced_issues;
DROP POLICY IF EXISTS "System manages webhook events" ON github_webhook_events;

-- Users can only access their own GitHub tokens
CREATE POLICY "Users can manage their own GitHub tokens" ON user_github_tokens
    FOR ALL USING (auth.uid() = user_id);

-- Users can only access repos linked to their projects
CREATE POLICY "Users can manage repos for their projects" ON github_linked_repos
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
        )
    );

-- Users can access synced issues for their tickets
CREATE POLICY "Users can access synced issues for their tickets" ON github_synced_issues
    FOR ALL USING (
        ticket_id IN (
            SELECT t.id FROM tickets t
            JOIN projects p ON t.project_id = p.id
            WHERE p.owner_id = auth.uid()
        )
    );

-- Webhook events are system-managed (no user access needed for now)
CREATE POLICY "System manages webhook events" ON github_webhook_events
    FOR ALL USING (false);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get user ID by email (for authentication)
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT id FROM auth.users WHERE email = user_email LIMIT 1);
END;
$$;

-- Grant execute permission only to the supabase_auth_admin role
REVOKE ALL ON FUNCTION get_user_id_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO supabase_auth_admin;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================


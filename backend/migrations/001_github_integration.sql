-- GitHub Integration Tables
-- Run these in your Supabase SQL editor

-- Table to store GitHub OAuth tokens for users
CREATE TABLE user_github_tokens (
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
CREATE TABLE github_linked_repos (
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
CREATE TABLE github_synced_issues (
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
CREATE TABLE github_webhook_events (
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

-- Indexes for better performance
CREATE INDEX idx_github_tokens_user_id ON user_github_tokens(user_id);
CREATE INDEX idx_github_repos_project_id ON github_linked_repos(project_id);
CREATE INDEX idx_github_repos_repo_id ON github_linked_repos(github_repo_id);
CREATE INDEX idx_synced_issues_ticket_id ON github_synced_issues(ticket_id);
CREATE INDEX idx_synced_issues_github_issue ON github_synced_issues(github_issue_id);
CREATE INDEX idx_synced_issues_repo_id ON github_synced_issues(repo_id);
CREATE INDEX idx_webhook_events_processed ON github_webhook_events(processed);
CREATE INDEX idx_webhook_events_repo_id ON github_webhook_events(repository_id);

-- RLS (Row Level Security) policies
ALTER TABLE user_github_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_linked_repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_synced_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_webhook_events ENABLE ROW LEVEL SECURITY;

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
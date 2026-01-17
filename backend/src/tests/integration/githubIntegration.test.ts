import request from "supertest";
import { GitHubSyncService } from "../../services/githubService.js";

// Define mocks globaly so we can access them in tests
const mockGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock("@supabase/supabase-js", () => {
    return {
        createClient: jest.fn(() => ({
            auth: {
                getUser: mockGetUser,
            },
            from: mockFrom,
        })),
    };
});

// Mock services
jest.mock("../../services/githubService.ts", () => ({
    GitHubService: jest.fn().mockImplementation(() => ({
        createIssue: jest.fn().mockResolvedValue({ id: 123, number: 1, html_url: "http://github.com/issue/1" }),
        updateIssue: jest.fn().mockResolvedValue({}),
        addComment: jest.fn().mockResolvedValue({}),
    })),
    GitHubTokenService: {
        getUserToken: jest.fn().mockResolvedValue({ data: { access_token: "mock_token" } }),
    },
    GitHubRepoService: {
        getProjectRepos: jest.fn().mockResolvedValue({ data: [{ id: "repo-uuid", repo_owner: "owner", repo_name: "repo" }] }),
    },
    GitHubSyncService: {
        createSyncRelation: jest.fn().mockResolvedValue({}),
        getSyncByTicketId: jest.fn(),
        updateLastSynced: jest.fn(),
        getSyncByGitHubIssue: jest.fn(),
    }
}));

describe("GitHub Integration Tests", () => {
    let app: any;

    beforeAll(() => {
        // Require app here so mocks are applied
        app = require("../../server.ts").default;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default success for Supabase
        mockGetUser.mockResolvedValue({ data: { user: { id: "user-uuid" } }, error: null });

        const mockChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { id: "linked-repo-id", project_id: "p-1" }, error: null }),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
        };
        mockFrom.mockReturnValue(mockChain);
    });

    describe("GET /api/v1/github/tickets/:ticket_id/sync", () => {
        it("should return sync status for a synced ticket", async () => {
            (GitHubSyncService.getSyncByTicketId as jest.Mock).mockResolvedValue({
                data: {
                    id: "sync-uuid",
                    github_issue_number: 10,
                    github_linked_repos: { html_url: "http://github.com/repo" }
                }
            });

            const res = await request(app)
                .get("/api/v1/github/tickets/123e4567-e89b-12d3-a456-426614174000/sync")
                .set("Authorization", "Bearer mock_token");

            expect(res.status).toBe(200);
            expect(res.body.synced).toBe(true);
            expect(res.body.sync_data.github_issue_number).toBe(10);
        });
    });

    describe("POST /api/v1/github/events", () => {
        it("should handle issue opened event", async () => {
            (GitHubSyncService.getSyncByGitHubIssue as jest.Mock).mockResolvedValue({ data: null }); // Not synced yet

            const payload = {
                action: "opened",
                repository: { id: 12345, name: "repo" },
                issue: { id: 101, number: 5, title: "New Issue", body: "Desc", user: { id: 99 } }
            };

            const res = await request(app)
                .post("/api/v1/webhooks/github/events")
                .set("X-GitHub-Event", "issues")
                .set("X-Hub-Signature-256", "sha256=MOCK_SIG") // Signature verification mocked/skipped
                .send(payload);

            expect(res.status).toBe(200);
        });
    });
});

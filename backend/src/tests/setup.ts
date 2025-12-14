// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock @supabase/supabase-js before any imports
const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

const mockGetUser = jest.fn().mockResolvedValue({
  data: { user: mockUser },
  error: null,
});

jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => ({
      auth: {
        getUser: mockGetUser,
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        admin: {
          generateLink: jest.fn(),
        },
      },
      from: jest.fn((table: string) => {
        const createMockChain = () => {
          let finalData: any = null;
          let finalError: any = null;
          
          const chain: any = {
            select: jest.fn((...args) => {
              // If this is called after insert/update, return chain for .single()
              return chain;
            }),
            eq: jest.fn((...args) => chain),
            order: jest.fn((...args) => chain),
            or: jest.fn((...args) => chain),
            insert: jest.fn((data) => {
              finalData = Array.isArray(data) ? data[0] : data;
              return chain;
            }),
            update: jest.fn((data) => {
              finalData = { ...finalData, ...data };
              return chain;
            }),
            delete: jest.fn(() => chain),
            upsert: jest.fn((data) => {
              finalData = Array.isArray(data) ? data[0] : data;
              return chain;
            }),
            single: jest.fn(() => Promise.resolve({ data: finalData, error: finalError })),
          };
          
          // For queries that end with .select() or .eq() without .single()
          const originalSelect = chain.select;
          chain.select.mockImplementation((...args: any[]) => {
            // If followed by .eq() or .order(), return chain
            // Otherwise return promise directly
            return chain;
          });
          
          // Override .eq() to return promise when it's the final call in a select chain
          const originalEq = chain.eq;
          chain.eq.mockImplementation((...args: any[]) => {
            // Check if this is being called after select - if so, return chain for further chaining
            // Otherwise return promise
            return chain;
          });
          
          // For select().eq() chains that should return arrays
          chain.select.mockReturnValueOnce(chain);
          
          return chain;
        };
        return createMockChain();
      }),
    })),
  };
});

// Export mock functions for test customization
export { mockGetUser, mockUser };

// Mock passport and githubService early to avoid ESM import issues
jest.mock('../config/passport.ts', () => {
  const mockPassport = {
    initialize: jest.fn(() => (req: any, res: any, next: any) => next()),
    session: jest.fn(() => (req: any, res: any, next: any) => next()),
    authenticate: jest.fn((strategy: string, options?: any) => (req: any, res: any, next: any) => next()),
    serializeUser: jest.fn(),
    deserializeUser: jest.fn(),
    use: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockPassport,
  };
});

jest.mock('../services/githubService.ts', () => ({
  GitHubService: jest.fn().mockImplementation(() => ({
    getUserRepos: jest.fn(),
    getRepo: jest.fn(),
    createIssue: jest.fn(),
    updateIssue: jest.fn(),
    getIssue: jest.fn(),
    getRepoIssues: jest.fn(),
    addComment: jest.fn(),
    getAuthenticatedUser: jest.fn(),
  })),
  GitHubTokenService: {
    getUserToken: jest.fn(),
    storeUserToken: jest.fn(),
    deleteUserToken: jest.fn(),
  },
  GitHubRepoService: {
    linkRepoToProject: jest.fn(),
    getProjectRepos: jest.fn(),
    unlinkRepo: jest.fn(),
    getRepoById: jest.fn(),
  },
  GitHubSyncService: {
    createSyncRelation: jest.fn(),
    getSyncByTicketId: jest.fn(),
    getSyncByGitHubIssue: jest.fn(),
    updateLastSynced: jest.fn(),
    deleteSyncRelation: jest.fn(),
  },
}));

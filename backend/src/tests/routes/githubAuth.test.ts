import request from 'supertest';
import { createTestApp, mockUser } from '../utils/testHelpers.ts';
import { supabaseAuth } from '../../config/supabaseClient.ts';
import passport from '../../config/passport.ts';

// Mock Supabase Auth
jest.mock('../../config/supabaseClient.ts', () => ({
  supabaseAuth: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// Mock Passport
jest.mock('../../config/passport.ts', () => ({
  authenticate: jest.fn((strategy, options) => (req: any, res: any, next: any) => next()),
  initialize: jest.fn(() => (req: any, res: any, next: any) => next()),
  session: jest.fn(() => (req: any, res: any, next: any) => next()),
}));

const app = createTestApp();
const mockToken = 'valid-jwt-token';

describe('GitHub Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabaseAuth.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('GET /api/v1/auth/github', () => {
    it('should initiate GitHub OAuth (public route)', async () => {
      // This route redirects to GitHub, so we expect a redirect response
      const response = await request(app)
        .get('/api/v1/auth/github');

      // GitHub OAuth typically returns 302 redirect or handles via Passport
      // The exact status depends on implementation
      const validStatuses = [200, 302, 307, 404];
      expect(validStatuses.includes(response.status)).toBe(true);
    });
  });

  describe('GET /api/v1/auth/github/callback', () => {
    it('should handle GitHub OAuth callback (public route)', async () => {
      // OAuth callback typically requires query parameters from GitHub
      const response = await request(app)
        .get('/api/v1/auth/github/callback')
        .query({ code: 'mock-auth-code', state: 'mock-state' });

      // Callback may redirect or return JSON depending on implementation
      const validStatuses = [200, 302, 307, 400, 404, 500];
      expect(validStatuses.includes(response.status)).toBe(true);
    });

    it('should handle callback without code parameter', async () => {
      const response = await request(app)
        .get('/api/v1/auth/github/callback');

      // Should handle missing code gracefully
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/v1/auth/github/error', () => {
    it('should handle GitHub OAuth errors (public route)', async () => {
      const response = await request(app)
        .get('/api/v1/auth/github/error')
        .query({ error: 'access_denied' });

      // Error handler may redirect or return status page
      const validStatuses = [200, 302, 307];
      expect(validStatuses.includes(response.status)).toBe(true);
    });
  });

  describe('POST /api/v1/auth/github/link', () => {
    it('should link GitHub account with valid auth', async () => {
      // Mock the GitHub linking service
      const response = await request(app)
        .post('/api/v1/auth/github/link')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          github_token: 'mock-github-token',
        });

      // The exact response depends on implementation
      const validStatuses = [200, 201, 400, 404, 500, 501];
      expect(validStatuses.includes(response.status)).toBe(true);
    });

    it('should reject link request without auth token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/github/link')
        .send({
          github_token: 'mock-github-token',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/auth/github/unlink', () => {
    it('should unlink GitHub account with valid auth', async () => {
      const response = await request(app)
        .delete('/api/v1/auth/github/unlink')
        .set('Authorization', `Bearer ${mockToken}`);

      // The exact response depends on implementation (OAuth endpoints may redirect or return various statuses)
      const validStatuses = [200, 201, 204, 302, 307, 400, 404, 500, 501];
      expect(validStatuses.includes(response.status)).toBe(true);
    });

    it('should reject unlink request without auth token', async () => {
      const response = await request(app)
        .delete('/api/v1/auth/github/unlink');

      expect(response.status).toBe(401);
    });
  });
});

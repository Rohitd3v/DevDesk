import request from 'supertest';
import { createTestApp, testFixtures, mockUser, generateUUID } from '../utils/testHelpers.ts';
import { supabaseAuth } from '../../config/supabaseClient.ts';
import { supabase } from '../../config/supabaseClient.ts';

// Mock Supabase
jest.mock('../../config/supabaseClient.ts', () => ({
  supabaseAuth: {
    auth: {
      getUser: jest.fn(),
    },
  },
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(),
        })),
      })),
    })),
  },
}));

const app = createTestApp();
const mockToken = 'valid-jwt-token';

describe('Ticket Comment API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabaseAuth.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('POST /api/v1/ticketcomment/:ticket_id', () => {
    it('should create comment with valid data and auth', async () => {
      const ticketId = generateUUID();
      const commentId = generateUUID();
      const mockComment = {
        id: commentId,
        ticket_id: ticketId,
        content: testFixtures.comment.content,
        author_id: mockUser.id,
      };

      // Mock the Supabase chain to return our comment
      const mockFrom = supabase.from as jest.Mock;
      const mockChain: any = {
        insert: jest.fn(() => mockChain),
        select: jest.fn(() => mockChain),
        single: jest.fn(() => Promise.resolve({ data: mockComment, error: null })),
      };
      mockFrom.mockReturnValue(mockChain);

      const response = await request(app)
        .post(`/api/v1/ticketcomment/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          content: testFixtures.comment.content,
        });

      expect(response.status).toBe(201);
    });

    it('should reject comment creation without auth token', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/ticketcomment/${ticketId}`)
        .send({
          content: testFixtures.comment.content,
        });

      expect(response.status).toBe(401);
    });

    it('should reject comment creation with missing content', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/ticketcomment/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject comment creation with empty content', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/ticketcomment/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          content: '',
        });

      expect(response.status).toBe(400);
    });

    it('should reject comment creation with invalid ticket_id UUID', async () => {
      const response = await request(app)
        .post('/api/v1/ticketcomment/invalid-uuid')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          content: testFixtures.comment.content,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/ticketcomment/:ticket_id', () => {
    it('should get comments by ticket ID with valid auth', async () => {
      const ticketId = generateUUID();
      const mockComments = [
        { id: generateUUID(), ticket_id: ticketId, content: 'Comment 1' },
        { id: generateUUID(), ticket_id: ticketId, content: 'Comment 2' },
      ];

      const mockFrom = supabase.from as jest.Mock;
      const mockChain: any = {
        select: jest.fn(() => mockChain),
        eq: jest.fn(() => mockChain),
        order: jest.fn(() => Promise.resolve({ data: mockComments, error: null })),
      };
      mockFrom.mockReturnValue(mockChain);

      const response = await request(app)
        .get(`/api/v1/ticketcomment/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .get(`/api/v1/ticketcomment/${ticketId}`);

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid ticket_id UUID', async () => {
      const response = await request(app)
        .get('/api/v1/ticketcomment/invalid-uuid')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/ticketcomment/:ticket_id/user', () => {
    it('should get comments by user with valid auth', async () => {
      const ticketId = generateUUID();
      const mockComments = [
        { id: generateUUID(), ticket_id: ticketId, author_id: mockUser.id },
      ];

      const mockFrom = supabase.from as jest.Mock;
      const mockChain: any = {
        select: jest.fn(() => mockChain),
        eq: jest.fn(() => mockChain),
      };
      // First .eq() for ticket_id returns chain, second .eq() for author_id returns data
      mockChain.eq.mockReturnValueOnce(mockChain);
      mockChain.eq.mockReturnValueOnce(Promise.resolve({ data: mockComments, error: null }));
      mockFrom.mockReturnValue(mockChain);

      const response = await request(app)
        .get(`/api/v1/ticketcomment/${ticketId}/user`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .get(`/api/v1/ticketcomment/${ticketId}/user`);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/ticketcomment/:ticket_id/:comment_id', () => {
    it('should delete comment with valid auth', async () => {
      const ticketId = generateUUID();
      const commentId = generateUUID();
      const mockDeletedComment = { id: commentId, ticket_id: ticketId };

      const mockFrom = supabase.from as jest.Mock;
      const mockChain: any = {
        delete: jest.fn(() => mockChain),
        eq: jest.fn(() => mockChain),
        select: jest.fn(() => mockChain),
        single: jest.fn(() => Promise.resolve({ data: mockDeletedComment, error: null })),
      };
      mockFrom.mockReturnValue(mockChain);

      const response = await request(app)
        .delete(`/api/v1/ticketcomment/${ticketId}/${commentId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject delete without auth token', async () => {
      const ticketId = generateUUID();
      const commentId = generateUUID();
      const response = await request(app)
        .delete(`/api/v1/ticketcomment/${ticketId}/${commentId}`);

      expect(response.status).toBe(401);
    });

    it('should reject delete with invalid ticket_id UUID', async () => {
      const commentId = generateUUID();
      const response = await request(app)
        .delete(`/api/v1/ticketcomment/invalid-uuid/${commentId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
    });

    it('should reject delete with invalid comment_id UUID', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .delete(`/api/v1/ticketcomment/${ticketId}/invalid-uuid`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
    });
  });
});

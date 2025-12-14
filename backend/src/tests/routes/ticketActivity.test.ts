import request from 'supertest';
import { createTestApp, testFixtures, mockUser, generateUUID } from '../utils/testHelpers.ts';
import { TicketActivityService } from '../../services/ticketActivityService.ts';
import { supabaseAuth } from '../../config/supabaseClient.ts';

// Mock Supabase Auth
jest.mock('../../config/supabaseClient.ts', () => ({
  supabaseAuth: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// Mock TicketActivityService
jest.mock('../../services/ticketActivityService.ts', () => ({
  TicketActivityService: {
    createActivity: jest.fn(),
    getActivitiesByTicketId: jest.fn(),
    getActivitiesByUserId: jest.fn(),
    deleteActivityById: jest.fn(),
  },
}));

const app = createTestApp();
const mockToken = 'valid-jwt-token';

describe('Ticket Activity API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabaseAuth.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('POST /api/v1/ticketAction/:ticket_id', () => {
    it('should create activity with valid data and auth', async () => {
      const ticketId = generateUUID();
      const activityId = generateUUID();
      const mockActivity = {
        id: activityId,
        ticket_id: ticketId,
        action: testFixtures.activity.action,
        details: testFixtures.activity.details,
        created_by: mockUser.id,
      };

      (TicketActivityService.createActivity as jest.Mock).mockResolvedValue({
        data: mockActivity,
        error: null,
      });

      const response = await request(app)
        .post(`/api/v1/ticketAction/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          action: testFixtures.activity.action,
          details: testFixtures.activity.details,
        });

      expect(response.status).toBe(201);
    });

    it('should reject activity creation without auth token', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/ticketAction/${ticketId}`)
        .send({
          action: testFixtures.activity.action,
        });

      expect(response.status).toBe(401);
    });

    it('should reject activity creation with missing action', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/ticketAction/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          details: testFixtures.activity.details,
        });

      expect(response.status).toBe(400);
    });

    it('should reject activity creation with empty action', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/ticketAction/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          action: '',
        });

      expect(response.status).toBe(400);
    });

    it('should reject activity creation with invalid ticket_id UUID', async () => {
      const response = await request(app)
        .post('/api/v1/ticketAction/invalid-uuid')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          action: testFixtures.activity.action,
        });

      expect(response.status).toBe(400);
    });

    it('should accept activity with optional details', async () => {
      const ticketId = generateUUID();
      const activityId = generateUUID();
      const mockActivity = {
        id: activityId,
        ticket_id: ticketId,
        action: testFixtures.activity.action,
        created_by: mockUser.id,
      };

      (TicketActivityService.createActivity as jest.Mock).mockResolvedValue({
        data: mockActivity,
        error: null,
      });

      const response = await request(app)
        .post(`/api/v1/ticketAction/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          action: testFixtures.activity.action,
        });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/v1/ticketAction/:ticket_id', () => {
    it('should get activities by ticket ID with valid auth', async () => {
      const ticketId = generateUUID();
      const mockActivities = [
        { id: generateUUID(), ticket_id: ticketId, action: 'created' },
        { id: generateUUID(), ticket_id: ticketId, action: 'updated' },
      ];

      (TicketActivityService.getActivitiesByTicketId as jest.Mock).mockResolvedValue({
        data: mockActivities,
        error: null,
      });

      const response = await request(app)
        .get(`/api/v1/ticketAction/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .get(`/api/v1/ticketAction/${ticketId}`);

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid ticket_id UUID', async () => {
      const response = await request(app)
        .get('/api/v1/ticketAction/invalid-uuid')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/ticketAction/user/:ticket_id', () => {
    it('should get activities by user with valid auth', async () => {
      const ticketId = generateUUID();
      const mockActivities = [
        { id: generateUUID(), ticket_id: ticketId, created_by: mockUser.id },
      ];

      (TicketActivityService.getActivitiesByUserId as jest.Mock).mockResolvedValue({
        data: mockActivities,
        error: null,
      });

      const response = await request(app)
        .get(`/api/v1/ticketAction/user/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .get(`/api/v1/ticketAction/user/${ticketId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/ticketAction/:ticket_id/:activity_id', () => {
    it('should delete activity with valid auth', async () => {
      const ticketId = generateUUID();
      const activityId = generateUUID();

      (TicketActivityService.deleteActivityById as jest.Mock).mockResolvedValue({
        data: { id: activityId, ticket_id: ticketId, action: 'deleted' },
        error: null,
      });

      const response = await request(app)
        .delete(`/api/v1/ticketAction/${ticketId}/${activityId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject delete without auth token', async () => {
      const ticketId = generateUUID();
      const activityId = generateUUID();
      const response = await request(app)
        .delete(`/api/v1/ticketAction/${ticketId}/${activityId}`);

      expect(response.status).toBe(401);
    });

    it('should reject delete with invalid ticket_id UUID', async () => {
      const activityId = generateUUID();
      const response = await request(app)
        .delete(`/api/v1/ticketAction/invalid-uuid/${activityId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
    });

    it('should reject delete with invalid activity_id UUID', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .delete(`/api/v1/ticketAction/${ticketId}/invalid-uuid`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
    });
  });
});

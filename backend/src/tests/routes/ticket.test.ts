import request from 'supertest';
import { createTestApp, testFixtures, mockUser, generateUUID } from '../utils/testHelpers.ts';
import { TicketService } from '../../services/ticketService.ts';
import { ProjectService } from '../../services/projectService.ts';
import { supabaseAuth } from '../../config/supabaseClient.ts';
import { STATUS, PRIORITY } from '../../types/ticketTypes.ts';

// Mock Supabase Auth
jest.mock('../../config/supabaseClient.ts', () => ({
  supabaseAuth: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// Mock ProjectService
jest.mock('../../services/projectService.ts', () => ({
  ProjectService: {
    getProjectById: jest.fn(),
  },
}));

// Mock TicketService
jest.mock('../../services/ticketService.ts', () => ({
  TicketService: {
    createTicket: jest.fn(),
    getTicketsByProject: jest.fn(),
    getTicketById: jest.fn(),
    updateTicket: jest.fn(),
    deleteTicket: jest.fn(),
    getAllTicketofuser: jest.fn(),
  },
}));

const app = createTestApp();
const mockToken = 'valid-jwt-token';

describe('Ticket API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabaseAuth.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('POST /api/v1/ticket/:project_id/tickets', () => {
    it('should create ticket with valid data and auth', async () => {
      const projectId = generateUUID();
      const ticketId = generateUUID();
      const mockTicket = {
        id: ticketId,
        project_id: projectId,
        title: testFixtures.ticket.title,
        description: testFixtures.ticket.description,
        status: testFixtures.ticket.status,
        priority: testFixtures.ticket.priority,
        created_by: mockUser.id,
      };

      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        data: { id: projectId, owner_id: mockUser.id },
        error: null,
      });

      (TicketService.createTicket as jest.Mock).mockResolvedValue({
        data: mockTicket,
        error: null,
      });

      const response = await request(app)
        .post(`/api/v1/ticket/${projectId}/tickets`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: testFixtures.ticket.title,
          description: testFixtures.ticket.description,
          status: testFixtures.ticket.status,
          priority: testFixtures.ticket.priority,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should reject ticket creation without auth token', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/ticket/${projectId}/tickets`)
        .send({
          title: testFixtures.ticket.title,
          description: testFixtures.ticket.description,
        });

      expect(response.status).toBe(401);
    });

    it('should reject ticket creation with missing title', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/ticket/${projectId}/tickets`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          description: testFixtures.ticket.description,
        });

      expect(response.status).toBe(400);
    });

    it('should reject ticket creation with missing description', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/ticket/${projectId}/tickets`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: testFixtures.ticket.title,
        });

      expect(response.status).toBe(400);
    });

    it('should reject ticket creation with invalid status', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/ticket/${projectId}/tickets`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: testFixtures.ticket.title,
          description: testFixtures.ticket.description,
          status: 'invalid_status',
        });

      expect(response.status).toBe(400);
    });

    it('should reject ticket creation with invalid priority', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/ticket/${projectId}/tickets`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: testFixtures.ticket.title,
          description: testFixtures.ticket.description,
          priority: 'invalid_priority',
        });

      expect(response.status).toBe(400);
    });

    it('should accept valid status values', async () => {
      const projectId = generateUUID();
      const ticketId = generateUUID();

      for (const status of STATUS) {
        (TicketService.createTicket as jest.Mock).mockResolvedValue({
          data: { id: ticketId, status },
          error: null,
        });

        const response = await request(app)
          .post(`/api/v1/ticket/${projectId}/tickets`)
          .set('Authorization', `Bearer ${mockToken}`)
          .send({
            title: testFixtures.ticket.title,
            description: testFixtures.ticket.description,
            status,
          });

        expect(response.status).toBe(201);
      }
    });

    it('should accept valid priority values', async () => {
      const projectId = generateUUID();
      const ticketId = generateUUID();

      for (const priority of PRIORITY) {
        (TicketService.createTicket as jest.Mock).mockResolvedValue({
          data: { id: ticketId, priority },
          error: null,
        });

        const response = await request(app)
          .post(`/api/v1/ticket/${projectId}/tickets`)
          .set('Authorization', `Bearer ${mockToken}`)
          .send({
            title: testFixtures.ticket.title,
            description: testFixtures.ticket.description,
            priority,
          });

        expect(response.status).toBe(201);
      }
    });
  });

  describe('GET /api/v1/ticket/:project_id/tickets', () => {
    it('should get tickets by project with valid auth', async () => {
      const projectId = generateUUID();
      const mockTickets = [
        { id: generateUUID(), project_id: projectId, title: 'Ticket 1' },
        { id: generateUUID(), project_id: projectId, title: 'Ticket 2' },
      ];

      (TicketService.getTicketsByProject as jest.Mock).mockResolvedValue({
        data: mockTickets,
        error: null,
      });

      const response = await request(app)
        .get(`/api/v1/ticket/${projectId}/tickets`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .get(`/api/v1/ticket/${projectId}/tickets`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/ticket/:ticket_id', () => {
    it('should get ticket by ID with valid auth', async () => {
      const ticketId = generateUUID();
      const mockTicket = {
        id: ticketId,
        title: testFixtures.ticket.title,
        description: testFixtures.ticket.description,
      };

      (TicketService.getTicketById as jest.Mock).mockResolvedValue({
        data: mockTicket,
        error: null,
      });

      const response = await request(app)
        .get(`/api/v1/ticket/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .get(`/api/v1/ticket/${ticketId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/ticket', () => {
    it('should get all tickets by user ID with valid auth', async () => {
      const mockTickets = [
        { id: generateUUID(), title: 'Ticket 1' },
        { id: generateUUID(), title: 'Ticket 2' },
      ];

      (TicketService.getAllTicketofuser as jest.Mock).mockResolvedValue({
        data: mockTickets,
        error: null,
      });

      const response = await request(app)
        .get('/api/v1/ticket')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/ticket');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/ticket/:ticket_id', () => {
    it('should update ticket with valid data and auth', async () => {
      const ticketId = generateUUID();
      const updatedTicket = {
        id: ticketId,
        title: 'Updated Title',
        description: 'Updated description',
        status: 'in_progress',
      };

      (TicketService.updateTicket as jest.Mock).mockResolvedValue({
        data: updatedTicket,
        error: null,
      });

      const response = await request(app)
        .patch(`/api/v1/ticket/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: 'Updated Title',
          status: 'in_progress',
        });

      expect(response.status).toBe(200);
    });

    it('should reject update without auth token', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .patch(`/api/v1/ticket/${ticketId}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(401);
    });

    it('should reject update with empty body', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .patch(`/api/v1/ticket/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject update with invalid status', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .patch(`/api/v1/ticket/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          status: 'invalid_status',
        });

      expect(response.status).toBe(400);
    });

    it('should reject update with invalid UUID for assigned_to', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .patch(`/api/v1/ticket/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          assigned_to: 'not-a-uuid',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/ticket/:ticket_id', () => {
    it('should delete ticket with valid auth', async () => {
      const ticketId = generateUUID();
      (TicketService.deleteTicket as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const response = await request(app)
        .delete(`/api/v1/ticket/${ticketId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject delete without auth token', async () => {
      const ticketId = generateUUID();
      const response = await request(app)
        .delete(`/api/v1/ticket/${ticketId}`);

      expect(response.status).toBe(401);
    });
  });
});

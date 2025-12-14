import request from 'supertest';
import { createTestApp, mockUser, generateUUID } from '../utils/testHelpers.ts';
import { NotificationService } from '../../services/notificationService.ts';
import { supabaseAuth } from '../../config/supabaseClient.ts';

// Mock Supabase Auth
jest.mock('../../config/supabaseClient.ts', () => ({
  supabaseAuth: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// Mock NotificationService
jest.mock('../../services/notificationService.ts', () => ({
  NotificationService: {
    getNotificationsByUser: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  },
}));

const app = createTestApp();
const mockToken = 'valid-jwt-token';

describe('Notification API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabaseAuth.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('should get notifications with valid auth', async () => {
      const mockNotifications = [
        {
          id: generateUUID(),
          user_id: mockUser.id,
          message: 'Test notification 1',
          read: false,
        },
        {
          id: generateUUID(),
          user_id: mockUser.id,
          message: 'Test notification 2',
          read: true,
        },
      ];

      (NotificationService.getNotificationsByUser as jest.Mock).mockResolvedValue({
        data: mockNotifications,
        error: null,
      });

      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/notifications');

      expect(response.status).toBe(401);
    });

    it('should return empty array when no notifications exist', async () => {
      (NotificationService.getNotificationsByUser as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/v1/notifications/:notificationId/read', () => {
    it('should mark notification as read with valid auth', async () => {
      const notificationId = generateUUID();
      const mockNotification = {
        id: notificationId,
        user_id: mockUser.id,
        read: true,
      };

      (NotificationService.markAsRead as jest.Mock).mockResolvedValue({
        data: mockNotification,
        error: null,
      });

      const response = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const notificationId = generateUUID();
      const response = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`);

      expect(response.status).toBe(401);
    });

    it('should handle non-existent notification', async () => {
      const notificationId = generateUUID();
      (NotificationService.markAsRead as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Notification not found' },
      });

      const response = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect([404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/v1/notifications/read/all', () => {
    it('should mark all notifications as read with valid auth', async () => {
      (NotificationService.markAllAsRead as jest.Mock).mockResolvedValue({
        data: { count: 5 },
        error: null,
      });

      const response = await request(app)
        .put('/api/v1/notifications/read/all')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .put('/api/v1/notifications/read/all');

      expect(response.status).toBe(401);
    });

    it('should handle when no unread notifications exist', async () => {
      (NotificationService.markAllAsRead as jest.Mock).mockResolvedValue({
        data: { count: 0 },
        error: null,
      });

      const response = await request(app)
        .put('/api/v1/notifications/read/all')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });
  });
});

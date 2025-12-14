import request from 'supertest';
import { createTestApp, testFixtures, mockUser, generateUUID } from '../utils/testHelpers.ts';
import { ProfileService } from '../../services/profileService.ts';
import { supabaseAuth } from '../../config/supabaseClient.ts';

// Mock Supabase Auth
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
        single: jest.fn(),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

// Mock ProfileService
jest.mock('../../services/profileService.ts', () => ({
  ProfileService: {
    getProfileById: jest.fn(),
    getAllProfiles: jest.fn(),
    createProfile: jest.fn(),
    updateProfile: jest.fn(),
    deleteProfile: jest.fn(),
  },
}));

const app = createTestApp();
const mockToken = 'valid-jwt-token';

describe('Profile API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful auth by default
    (supabaseAuth.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('POST /api/v1/profiles', () => {
    it('should create a profile with valid data and auth', async () => {
      (ProfileService.getProfileById as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      (ProfileService.createProfile as jest.Mock).mockResolvedValue({
        data: {
          id: mockUser.id,
          username: testFixtures.user.username,
          full_name: testFixtures.user.full_name,
        },
        error: null,
      });

      const response = await request(app)
        .post('/api/v1/profiles')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          username: testFixtures.user.username,
          full_name: testFixtures.user.full_name,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should reject profile creation without auth token', async () => {
      const response = await request(app)
        .post('/api/v1/profiles')
        .send({
          username: testFixtures.user.username,
        });

      expect(response.status).toBe(401);
    });

    it('should reject profile creation with missing username', async () => {
      const response = await request(app)
        .post('/api/v1/profiles')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          full_name: testFixtures.user.full_name,
        });

      expect(response.status).toBe(400);
    });

    it('should reject profile creation if profile already exists', async () => {
      (ProfileService.getProfileById as jest.Mock).mockResolvedValue({
        data: { id: mockUser.id, username: 'existing' },
        error: null,
      });

      const response = await request(app)
        .post('/api/v1/profiles')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          username: testFixtures.user.username,
        });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/v1/profiles', () => {
    it('should get all profiles (public route)', async () => {
      const mockProfiles = [
        { id: '1', username: 'user1' },
        { id: '2', username: 'user2' },
      ];

      (ProfileService.getAllProfiles as jest.Mock).mockResolvedValue({
        data: mockProfiles,
        error: null,
      });

      const response = await request(app)
        .get('/api/v1/profiles');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/profiles/:id', () => {
    it('should get profile by ID with valid auth', async () => {
      const profileId = generateUUID();
      const mockProfile = {
        id: profileId,
        username: testFixtures.user.username,
        full_name: testFixtures.user.full_name,
      };

      (ProfileService.getProfileById as jest.Mock).mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const response = await request(app)
        .get(`/api/v1/profiles/${profileId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const profileId = generateUUID();
      const response = await request(app)
        .get(`/api/v1/profiles/${profileId}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent profile', async () => {
      const profileId = generateUUID();
      (ProfileService.getProfileById as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const response = await request(app)
        .get(`/api/v1/profiles/${profileId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/profiles/:id', () => {
    it('should update profile with valid data and auth', async () => {
      // Use the same ID as mockUser.id to pass authorization check
      const profileId = mockUser.id;
      const updatedProfile = {
        id: profileId,
        username: 'updated-username',
        full_name: 'Updated Name',
      };

      (ProfileService.updateProfile as jest.Mock).mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      const response = await request(app)
        .patch(`/api/v1/profiles/${profileId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          full_name: 'Updated Name',
        });

      expect(response.status).toBe(200);
    });

    it('should reject update without auth token', async () => {
      const profileId = generateUUID();
      const response = await request(app)
        .patch(`/api/v1/profiles/${profileId}`)
        .send({
          full_name: 'Updated Name',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/profiles/:id', () => {
    it('should delete profile with valid auth', async () => {
      // Use the same ID as mockUser.id to pass authorization check
      const profileId = mockUser.id;
      (ProfileService.deleteProfile as jest.Mock).mockResolvedValue({
        data: { id: profileId },
        error: null,
      });

      const response = await request(app)
        .delete(`/api/v1/profiles/${profileId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject delete without auth token', async () => {
      const profileId = generateUUID();
      const response = await request(app)
        .delete(`/api/v1/profiles/${profileId}`);

      expect(response.status).toBe(401);
    });
  });
});

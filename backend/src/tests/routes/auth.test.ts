import request from 'supertest';
import { createTestApp, testFixtures } from '../utils/testHelpers.ts';
import { AuthService } from '../../services/authService.ts';

// Mock Supabase Auth Service
jest.mock('../../services/authService.ts', () => ({
  AuthService: {
    signUp: jest.fn(),
    signIn: jest.fn(),
  },
}));

const app = createTestApp();

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should sign up a new user with valid data', async () => {
      const mockUser = {
        id: '123',
        email: testFixtures.user.email,
      };

      (AuthService.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: testFixtures.user.email,
          password: testFixtures.user.password,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Signup successful');
      expect(response.body.user).toBeDefined();
      expect(AuthService.signUp).toHaveBeenCalledWith(
        testFixtures.user.email,
        testFixtures.user.password
      );
    });

    it('should reject signup with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'invalid-email',
          password: testFixtures.user.password,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject signup with password less than 6 characters', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: testFixtures.user.email,
          password: '12345',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject signup with missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          password: testFixtures.user.password,
        });

      expect(response.status).toBe(400);
    });

    it('should reject signup with missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: testFixtures.user.email,
        });

      expect(response.status).toBe(400);
    });

    it('should handle signup errors from Supabase', async () => {
      (AuthService.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'User already exists' },
      });

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: testFixtures.user.email,
          password: testFixtures.user.password,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: testFixtures.user.email,
      };

      const mockSession = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
      };

      (AuthService.signIn as jest.Mock).mockResolvedValue({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testFixtures.user.email,
          password: testFixtures.user.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Signin successful');
      expect(response.body.user).toBeDefined();
      expect(response.body.session).toBeDefined();
      expect(AuthService.signIn).toHaveBeenCalledWith(
        testFixtures.user.email,
        testFixtures.user.password
      );
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: testFixtures.user.password,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject login with missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: testFixtures.user.password,
        });

      expect(response.status).toBe(400);
    });

    it('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testFixtures.user.email,
        });

      expect(response.status).toBe(400);
    });

    it('should handle login errors from Supabase', async () => {
      (AuthService.signIn as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testFixtures.user.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});

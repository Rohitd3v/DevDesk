import type { Express } from 'express';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import passport from '../../config/passport.ts';
import authRouters from '../../routes/authRouter.ts';
import authProfiles from '../../routes/profileRouter.ts';
import authprojects from '../../routes/projectsRouter.ts';
import ticketsRouter from '../../routes/ticketsRouter.ts';
import ticketcommentsRouter from '../../routes/ticketCommentsRouter.ts';
import ticketActionRouter from '../../routes/ticketActivityRouter.ts';
import githubAuthRouter from '../../routes/githubAuthRouter.ts';
import githubRepoRouter from '../../routes/githubRepoRouter.ts';
import notificationRouter from '../../routes/notificationRouter.ts';

// Mock user data for testing
export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

// Create Express app for testing
export const createTestApp = (): Express => {
  const app = express();

  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  }));

  app.use(express.json());

  // Session configuration for Passport
  app.use(session({
    secret: process.env.SESSION_SECRET || 'test-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Routes
  app.use('/api/v1/auth', authRouters);
  app.use('/api/v1/auth', githubAuthRouter);
  app.use('/api/v1/profiles', authProfiles);
  app.use('/api/v1/projects', authprojects);
  app.use('/api/v1/ticket', ticketsRouter);
  app.use('/api/v1/ticketcomment', ticketcommentsRouter);
  app.use('/api/v1/ticketAction', ticketActionRouter);
  app.use('/api/v1/github', githubRepoRouter);
  app.use('/api/v1/notifications', notificationRouter);

  return app;
};

// Generate mock auth token
export const getAuthToken = (): string => {
  // For testing, we'll use a mock token
  // In real tests, you might want to use actual Supabase auth
  return 'mock-jwt-token-for-testing';
};

// Create test user data
export const createTestUser = (overrides?: Partial<typeof mockUser>) => {
  return { ...mockUser, ...overrides };
};

// Test fixtures
export const testFixtures = {
  user: {
    email: 'test@example.com',
    password: 'testpassword123',
    username: 'testuser',
    full_name: 'Test User',
  },
  project: {
    name: 'Test Project',
    description: 'Test project description',
  },
  ticket: {
    title: 'Test Ticket',
    description: 'Test ticket description',
    status: 'open' as const,
    priority: 'medium' as const,
  },
  comment: {
    content: 'Test comment content',
  },
  activity: {
    action: 'created',
    details: 'Ticket was created',
  },
};

// UUID generator for tests
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

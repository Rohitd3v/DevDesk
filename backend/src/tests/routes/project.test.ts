import request from 'supertest';
import { createTestApp, testFixtures, mockUser, generateUUID } from '../utils/testHelpers.ts';
import { ProjectService } from '../../services/projectService.ts';
import { supabaseAuth } from '../../config/supabaseClient.ts';

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
    getProjectsByUser: jest.fn(),
    getProjectById: jest.fn(),
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  },
}));

const app = createTestApp();
const mockToken = 'valid-jwt-token';

describe('Project API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabaseAuth.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('GET /api/v1/projects', () => {
    it('should get user projects with valid auth', async () => {
      const mockProjects = [
        { id: generateUUID(), name: 'Project 1', description: 'Desc 1' },
        { id: generateUUID(), name: 'Project 2', description: 'Desc 2' },
      ];

      (ProjectService.getProjectsByUser as jest.Mock).mockResolvedValue({
        data: mockProjects,
        error: null,
      });

      const response = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/projects');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/projects/:P_id', () => {
    it('should get project by ID with valid auth', async () => {
      const projectId = generateUUID();
      const mockProject = {
        id: projectId,
        name: testFixtures.project.name,
        description: testFixtures.project.description,
      };

      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        data: mockProject,
        error: null,
      });

      const response = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .get(`/api/v1/projects/${projectId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/projects', () => {
    it('should create project with valid data and auth', async () => {
      const projectId = generateUUID();
      const mockProject = {
        id: projectId,
        name: testFixtures.project.name,
        description: testFixtures.project.description,
        created_by: mockUser.id,
      };

      (ProjectService.createProject as jest.Mock).mockResolvedValue({
        data: mockProject,
        error: null,
      });

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          name: testFixtures.project.name,
          description: testFixtures.project.description,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should reject project creation without auth token', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .send({
          name: testFixtures.project.name,
        });

      expect(response.status).toBe(401);
    });

    it('should reject project creation with missing name', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          description: testFixtures.project.description,
        });

      expect(response.status).toBe(400);
    });

    it('should reject project creation with empty name', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          name: '',
          description: testFixtures.project.description,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/v1/projects/:P_id', () => {
    it('should update project with valid data and auth', async () => {
      const projectId = generateUUID();
      const updatedProject = {
        id: projectId,
        name: 'Updated Project Name',
        description: 'Updated description',
      };

      (ProjectService.updateProject as jest.Mock).mockResolvedValue({
        data: updatedProject,
        error: null,
      });

      const response = await request(app)
        .patch(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          name: 'Updated Project Name',
        });

      expect(response.status).toBe(200);
    });

    it('should reject update without auth token', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .patch(`/api/v1/projects/${projectId}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(401);
    });

    it('should reject update with empty name', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .patch(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          name: '',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/projects/:P_id', () => {
    it('should delete project with valid auth', async () => {
      const projectId = generateUUID();
      (ProjectService.deleteProject as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const response = await request(app)
        .delete(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject delete without auth token', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .delete(`/api/v1/projects/${projectId}`);

      expect(response.status).toBe(401);
    });
  });
});

import request from 'supertest';
import { createTestApp, mockUser, generateUUID } from '../utils/testHelpers.ts';
import { GitHubService, GitHubTokenService, GitHubRepoService } from '../../services/githubService.ts';
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
    getProjectById: jest.fn(),
  },
}));

// Mock GitHubService (class) and services
jest.mock('../../services/githubService.ts', () => ({
  GitHubService: jest.fn().mockImplementation(() => ({
    getUserRepos: jest.fn(),
    getRepo: jest.fn(),
  })),
  GitHubTokenService: {
    getUserToken: jest.fn(),
  },
  GitHubRepoService: {
    linkRepoToProject: jest.fn(),
    getProjectRepos: jest.fn(),
    unlinkRepo: jest.fn(),
    getRepoById: jest.fn(),
  },
}));

const app = createTestApp();
const mockToken = 'valid-jwt-token';

describe('GitHub Repo API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabaseAuth.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('GET /api/v1/github/connection', () => {
    it('should get GitHub connection status with valid auth', async () => {
      (GitHubTokenService.getUserToken as jest.Mock).mockResolvedValue({
        data: { access_token: 'token', github_username: 'testuser' },
        error: null,
      });

      const response = await request(app)
        .get('/api/v1/github/connection')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/github/connection');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/github/repositories', () => {
    it('should get user repositories with valid auth', async () => {
      const mockRepos = [
        { id: 123, name: 'repo1', full_name: 'user/repo1' },
        { id: 456, name: 'repo2', full_name: 'user/repo2' },
      ];

      (GitHubTokenService.getUserToken as jest.Mock).mockResolvedValue({
        data: { access_token: 'token' },
        error: null,
      });

      const mockGitHubServiceInstance = {
        getUserRepos: jest.fn().mockResolvedValue(mockRepos),
      };
      (GitHubService as jest.Mock).mockImplementation(() => mockGitHubServiceInstance);

      const response = await request(app)
        .get('/api/v1/github/repositories')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/github/repositories');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/github/projects/:project_id/repositories', () => {
    it('should get linked repositories for project with valid auth', async () => {
      const projectId = generateUUID();
      const mockLinkedRepos = [
        { id: generateUUID(), project_id: projectId, github_repo_id: 123 },
      ];

      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        data: { id: projectId },
        error: null,
      });

      (GitHubRepoService.getProjectRepos as jest.Mock).mockResolvedValue({
        data: mockLinkedRepos,
        error: null,
      });

      const response = await request(app)
        .get(`/api/v1/github/projects/${projectId}/repositories`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject request without auth token', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .get(`/api/v1/github/projects/${projectId}/repositories`);

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid project_id UUID', async () => {
      const response = await request(app)
        .get('/api/v1/github/projects/invalid-uuid/repositories')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/github/projects/:project_id/repositories', () => {
    it('should link repository to project with valid data and auth', async () => {
      const projectId = generateUUID();
      const mockLinkedRepo = {
        id: generateUUID(),
        project_id: projectId,
        github_repo_id: 123,
        repo_owner: 'testuser',
        repo_name: 'testrepo',
      };

      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        data: { id: projectId },
        error: null,
      });

      (GitHubTokenService.getUserToken as jest.Mock).mockResolvedValue({
        data: { access_token: 'token' },
        error: null,
      });

      const mockGitHubServiceInstance = {
        getRepo: jest.fn().mockResolvedValue({
          id: 123,
          name: 'testrepo',
          owner: { login: 'testuser' },
          full_name: 'testuser/testrepo',
          clone_url: 'https://github.com/testuser/testrepo.git',
          html_url: 'https://github.com/testuser/testrepo',
          default_branch: 'main',
        }),
      };
      (GitHubService as jest.Mock).mockImplementation(() => mockGitHubServiceInstance);

      (GitHubRepoService.linkRepoToProject as jest.Mock).mockResolvedValue({
        data: mockLinkedRepo,
        error: null,
      });

      const response = await request(app)
        .post(`/api/v1/github/projects/${projectId}/repositories`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          repo_owner: 'testuser',
          repo_name: 'testrepo',
          github_repo_id: 123,
        });

      expect(response.status).toBe(201);
    });

    it('should reject link request without auth token', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/github/projects/${projectId}/repositories`)
        .send({
          repo_owner: 'testuser',
          repo_name: 'testrepo',
          github_repo_id: 123,
        });

      expect(response.status).toBe(401);
    });

    it('should reject link request with missing repo_owner', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/github/projects/${projectId}/repositories`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          repo_name: 'testrepo',
          github_repo_id: 123,
        });

      expect(response.status).toBe(400);
    });

    it('should reject link request with missing repo_name', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/github/projects/${projectId}/repositories`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          repo_owner: 'testuser',
          github_repo_id: 123,
        });

      expect(response.status).toBe(400);
    });

    it('should reject link request with invalid github_repo_id', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .post(`/api/v1/github/projects/${projectId}/repositories`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          repo_owner: 'testuser',
          repo_name: 'testrepo',
          github_repo_id: -1,
        });

      expect(response.status).toBe(400);
    });

    it('should reject link request with invalid project_id UUID', async () => {
      const response = await request(app)
        .post('/api/v1/github/projects/invalid-uuid/repositories')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          repo_owner: 'testuser',
          repo_name: 'testrepo',
          github_repo_id: 123,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/github/projects/:project_id/repositories/:repo_id', () => {
    it('should unlink repository from project with valid auth', async () => {
      const projectId = generateUUID();
      const repoId = generateUUID();

      (ProjectService.getProjectById as jest.Mock).mockResolvedValue({
        data: { id: projectId },
        error: null,
      });

      (GitHubRepoService.getRepoById as jest.Mock).mockResolvedValue({
        data: { id: repoId, project_id: projectId },
        error: null,
      });

      (GitHubRepoService.unlinkRepo as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const response = await request(app)
        .delete(`/api/v1/github/projects/${projectId}/repositories/${repoId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject unlink request without auth token', async () => {
      const projectId = generateUUID();
      const repoId = generateUUID();
      const response = await request(app)
        .delete(`/api/v1/github/projects/${projectId}/repositories/${repoId}`);

      expect(response.status).toBe(401);
    });

    it('should reject unlink request with invalid project_id UUID', async () => {
      const repoId = generateUUID();
      const response = await request(app)
        .delete(`/api/v1/github/projects/invalid-uuid/repositories/${repoId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
    });

    it('should reject unlink request with invalid repo_id UUID', async () => {
      const projectId = generateUUID();
      const response = await request(app)
        .delete(`/api/v1/github/projects/${projectId}/repositories/invalid-uuid`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
    });
  });
});

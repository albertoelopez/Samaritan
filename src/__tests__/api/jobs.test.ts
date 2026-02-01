import request from 'supertest';
import app from '../../app';

// Mock the JobService
jest.mock('../../services/jobService', () => ({
  JobService: {
    searchJobs: jest.fn(),
    getJob: jest.fn(),
    createJob: jest.fn(),
    updateJob: jest.fn(),
    deleteJob: jest.fn(),
    publishJob: jest.fn(),
    cancelJob: jest.fn(),
    getContractorJobs: jest.fn(),
    findNearbyJobs: jest.fn(),
  },
}));

// Mock Redis
jest.mock('../../config/redis', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    delPattern: jest.fn(),
  },
  getRedisClient: jest.fn(),
  closeRedisConnection: jest.fn(),
}));

import { JobService } from '../../services/jobService';
import { NotFoundError } from '../../utils/errors';

describe('Jobs API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/jobs/search', () => {
    it('should return search results', async () => {
      const mockJobs = [
        {
          id: 'job-1',
          title: 'Test Job',
          description: 'Test description',
          status: 'published',
          contractor_id: 'contractor-1',
          job_type: 'one_time',
          payment_type: 'hourly',
          hourly_rate: 25,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (JobService.searchJobs as jest.Mock).mockResolvedValue({
        jobs: mockJobs,
        total: 1,
      });

      const response = await request(app)
        .get('/api/v1/jobs/search')
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.jobs).toHaveLength(1);
    });

    it('should filter by category', async () => {
      (JobService.searchJobs as jest.Mock).mockResolvedValue({
        jobs: [],
        total: 0,
      });

      const response = await request(app)
        .get('/api/v1/jobs/search')
        .query({ categoryId: '123e4567-e89b-12d3-a456-426614174000' });

      expect(response.status).toBe(200);
      expect(response.body.data.jobs).toEqual([]);
    });
  });

  describe('GET /api/v1/jobs/:id', () => {
    it('should return a job by id', async () => {
      const mockJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Job',
        description: 'Test description',
        status: 'published',
        contractor_id: 'contractor-1',
        job_type: 'one_time',
        payment_type: 'hourly',
        hourly_rate: 25,
        views_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (JobService.getJob as jest.Mock).mockResolvedValue(mockJob);

      const response = await request(app)
        .get('/api/v1/jobs/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should return 404 for non-existent job', async () => {
      (JobService.getJob as jest.Mock).mockRejectedValue(
        new NotFoundError('Job not found')
      );

      const response = await request(app)
        .get('/api/v1/jobs/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(404);
    });

    it('should return 422 for invalid job id', async () => {
      const response = await request(app)
        .get('/api/v1/jobs/invalid-id');

      expect(response.status).toBe(422);
    });
  });

  describe('POST /api/v1/jobs', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/jobs')
        .send({
          title: 'New Job',
          description: 'Job description',
          jobType: 'one_time',
          paymentType: 'hourly',
          hourlyRate: 25,
        });

      expect(response.status).toBe(401);
    });
  });
});

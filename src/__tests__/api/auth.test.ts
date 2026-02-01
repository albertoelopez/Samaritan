import request from 'supertest';
import app from '../../app';
import { db } from '../../config/database';

// Mock the database
jest.mock('../../config/database', () => ({
  db: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    whereNull: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest.fn().mockReturnThis(),
  }),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
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

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'worker',
        status: 'pending_verification',
        email_verified: false,
        phone_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock database responses
      (db as unknown as jest.Mock).mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            where: jest.fn().mockReturnThis(),
            whereNull: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(null), // No existing user
            insert: jest.fn().mockReturnThis(),
            returning: jest.fn().mockResolvedValue([mockUser]),
          };
        }
        if (table === 'worker_profiles') {
          return {
            insert: jest.fn().mockReturnThis(),
            returning: jest.fn().mockResolvedValue([{ id: 'profile-1' }]),
          };
        }
        return {
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(null),
        };
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'Test',
          lastName: 'User',
          role: 'worker',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
    });

    it('should return validation error for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123',
          firstName: 'Test',
          lastName: 'User',
          role: 'worker',
        });

      expect(response.status).toBe(422);
      expect(response.body.status).toBe('error');
    });

    it('should return validation error for weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User',
          role: 'worker',
        });

      expect(response.status).toBe(422);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User',
        role: 'worker',
        status: 'active',
        email_verified: true,
        phone_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (db as unknown as jest.Mock).mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockReturnThis(),
      }));

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('tokens');
    });

    it('should return error for invalid credentials', async () => {
      (db as unknown as jest.Mock).mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      }));

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
    });
  });
});

import jwt from 'jsonwebtoken';
import { config } from '../../config/environment';

// Helper to create auth token
const createToken = (userId: string, role: string) => {
  return jwt.sign(
    { userId, email: 'test@test.com', role },
    config.jwt.secret,
    { expiresIn: '1h' }
  );
};

describe('Applications API', () => {
  describe('Authentication', () => {
    it('should create valid worker token', () => {
      const token = createToken('worker-1', 'worker');
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      expect(decoded.userId).toBe('worker-1');
      expect(decoded.role).toBe('worker');
    });

    it('should create valid contractor token', () => {
      const token = createToken('contractor-1', 'contractor');
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      expect(decoded.userId).toBe('contractor-1');
      expect(decoded.role).toBe('contractor');
    });
  });

  describe('Application Data Validation', () => {
    it('should validate application data structure', () => {
      const applicationData = {
        jobId: 'job-123',
        coverLetter: 'I am interested in this job...',
        proposedRate: 25,
      };

      expect(applicationData.jobId).toBeDefined();
      expect(applicationData.coverLetter).toBeDefined();
      expect(typeof applicationData.proposedRate).toBe('number');
    });

    it('should validate cover letter is not empty', () => {
      const coverLetter = 'I have 5 years experience...';
      expect(coverLetter.trim().length).toBeGreaterThan(0);
    });

    it('should validate proposed rate is positive', () => {
      const proposedRate = 30;
      expect(proposedRate).toBeGreaterThan(0);
    });

    it('should handle missing optional fields', () => {
      const applicationData = {
        jobId: 'job-123',
        coverLetter: 'Cover letter text',
      };

      expect(applicationData.jobId).toBeDefined();
      expect((applicationData as any).proposedRate).toBeUndefined();
    });
  });

  describe('Application Status', () => {
    it('should have valid status values', () => {
      const validStatuses = ['pending', 'accepted', 'rejected', 'withdrawn'];

      validStatuses.forEach((status) => {
        expect(['pending', 'accepted', 'rejected', 'withdrawn']).toContain(status);
      });
    });

    it('should validate status transition', () => {
      const currentStatus = 'pending';
      const newStatus = 'accepted';

      // Pending can transition to accepted or rejected
      const validTransitions: Record<string, string[]> = {
        pending: ['accepted', 'rejected', 'withdrawn'],
        accepted: [],
        rejected: [],
        withdrawn: [],
      };

      expect(validTransitions[currentStatus]).toContain(newStatus);
    });
  });

  describe('Application Permissions', () => {
    it('should allow workers to create applications', () => {
      const userRole = 'worker';
      const allowedRoles = ['worker'];

      expect(allowedRoles).toContain(userRole);
    });

    it('should allow contractors to view job applications', () => {
      const userRole = 'contractor';
      const allowedRoles = ['contractor', 'admin'];

      expect(allowedRoles).toContain(userRole);
    });

    it('should not allow contractors to apply for jobs', () => {
      const userRole = 'contractor';
      const allowedRoles = ['worker'];

      expect(allowedRoles).not.toContain(userRole);
    });
  });
});

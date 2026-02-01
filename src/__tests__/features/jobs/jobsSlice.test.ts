import jobsReducer, {
  jobsReceived,
  jobAdded,
  jobUpdated,
  jobRemoved,
  jobRealTimeUpdate,
  setJobFilter,
  selectJob,
  setJobsLoading,
  setJobsError,
  setPage,
  selectAllJobs,
  selectJobById,
  selectJobsFilter,
  selectJobsLoading,
  selectJobsError,
  selectJobsPagination,
} from '../../../features/jobs/jobsSlice';
import { Job } from '../../../types/job.types';

describe('jobsSlice', () => {
  const mockJob: Job = {
    id: 'job-1',
    contractorId: 'contractor-1',
    title: 'Test Job',
    description: 'Test description',
    category: 'CONSTRUCTION' as any,
    location: {
      address: '123 Main St',
      city: 'LA',
      state: 'CA',
      zipCode: '90001',
      coordinates: { latitude: 34.0522, longitude: -118.2437 },
    },
    requirements: {
      experienceLevel: 'ENTRY_LEVEL' as any,
      skillsRequired: [],
      certificationsRequired: [],
      backgroundCheckRequired: false,
      drugTestRequired: false,
      physicalRequirements: [],
      transportationRequired: false,
      ownToolsRequired: false,
    },
    compensation: {
      type: 'HOURLY' as any,
      amount: 25,
      currency: 'USD',
      paymentSchedule: 'WEEKLY' as any,
      overtime: false,
      tipsAllowed: false,
      expensesReimbursed: false,
    },
    schedule: {
      type: 'FIXED' as any,
      startDate: new Date().toISOString(),
      startTime: '08:00',
      timeZone: 'America/Los_Angeles',
      flexibleHours: false,
      breakDuration: 30,
    },
    status: 'ACTIVE' as any,
    urgency: 'NORMAL' as any,
    workersNeeded: 1,
    workersAssigned: 0,
    applicationsCount: 0,
    tags: [],
    isPublic: true,
    isRecurring: false,
    estimatedDuration: 8,
    weatherDependent: false,
    safetyRequirements: [],
    toolsRequired: [],
    materialsProvided: true,
    parkingAvailable: true,
    contractorRating: 4.5,
    contractorReviewCount: 10,
    postedAt: new Date().toISOString(),
    startsAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const getInitialState = () =>
    jobsReducer(undefined, { type: 'unknown' });

  describe('reducers', () => {
    it('should return the initial state', () => {
      const state = getInitialState();
      expect(state.ids).toEqual([]);
      expect(state.entities).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle jobsReceived', () => {
      const jobs = [mockJob, { ...mockJob, id: 'job-2', title: 'Second Job' }];
      const actual = jobsReducer(
        getInitialState(),
        jobsReceived({ jobs, totalCount: 2, page: 1 })
      );

      expect(Object.keys(actual.entities)).toHaveLength(2);
      expect(actual.totalCount).toBe(2);
      expect(actual.currentPage).toBe(1);
      expect(actual.isLoading).toBe(false);
    });

    it('should handle jobAdded', () => {
      const actual = jobsReducer(getInitialState(), jobAdded(mockJob));

      expect(actual.ids).toContain('job-1');
      expect(actual.entities['job-1']).toEqual(mockJob);
    });

    it('should handle jobUpdated', () => {
      const stateWithJob = jobsReducer(getInitialState(), jobAdded(mockJob));
      const actual = jobsReducer(
        stateWithJob,
        jobUpdated({ id: 'job-1', changes: { title: 'Updated Title' } })
      );

      expect(actual.entities['job-1']?.title).toBe('Updated Title');
    });

    it('should handle jobRemoved', () => {
      const stateWithJob = jobsReducer(getInitialState(), jobAdded(mockJob));
      const actual = jobsReducer(stateWithJob, jobRemoved('job-1'));

      expect(actual.ids).not.toContain('job-1');
      expect(actual.entities['job-1']).toBeUndefined();
    });

    it('should handle jobRealTimeUpdate for new job', () => {
      const actual = jobsReducer(getInitialState(), jobRealTimeUpdate(mockJob));

      expect(actual.ids).toContain('job-1');
      expect(actual.entities['job-1']).toEqual(mockJob);
    });

    it('should handle jobRealTimeUpdate for existing job', () => {
      const stateWithJob = jobsReducer(getInitialState(), jobAdded(mockJob));
      const updatedJob = { ...mockJob, title: 'Real-time Updated' };
      const actual = jobsReducer(stateWithJob, jobRealTimeUpdate(updatedJob));

      expect(actual.entities['job-1']?.title).toBe('Real-time Updated');
    });

    it('should handle setJobFilter', () => {
      const actual = jobsReducer(
        getInitialState(),
        setJobFilter({ category: 'CONSTRUCTION' as any, status: 'ACTIVE' as any })
      );

      expect(actual.filter.category).toBe('CONSTRUCTION');
      expect(actual.filter.status).toBe('ACTIVE');
      expect(actual.currentPage).toBe(1); // Reset to first page
    });

    it('should handle selectJob', () => {
      const actual = jobsReducer(getInitialState(), selectJob('job-1'));

      expect(actual.selectedJobId).toBe('job-1');
    });

    it('should handle selectJob with null', () => {
      const stateWithSelection = jobsReducer(getInitialState(), selectJob('job-1'));
      const actual = jobsReducer(stateWithSelection, selectJob(null));

      expect(actual.selectedJobId).toBeNull();
    });

    it('should handle setJobsLoading', () => {
      const actual = jobsReducer(getInitialState(), setJobsLoading(true));

      expect(actual.isLoading).toBe(true);
    });

    it('should handle setJobsError', () => {
      const loadingState = jobsReducer(getInitialState(), setJobsLoading(true));
      const actual = jobsReducer(loadingState, setJobsError('Network error'));

      expect(actual.error).toBe('Network error');
      expect(actual.isLoading).toBe(false);
    });

    it('should handle setPage', () => {
      const actual = jobsReducer(getInitialState(), setPage(3));

      expect(actual.currentPage).toBe(3);
    });
  });

  describe('selectors', () => {
    const mockState = {
      jobs: {
        ...getInitialState(),
        ids: ['job-1', 'job-2'],
        entities: {
          'job-1': mockJob,
          'job-2': { ...mockJob, id: 'job-2', title: 'Second Job' },
        },
        filter: {
          category: 'CONSTRUCTION' as any,
          location: null,
          priceRange: null,
          experienceLevel: null,
          urgency: null,
          status: 'ACTIVE' as any,
          availability: null,
          sortBy: 'createdAt' as const,
          sortOrder: 'desc' as const,
        },
        totalCount: 2,
        currentPage: 1,
        pageSize: 20,
      },
    };

    it('should select all jobs', () => {
      const jobs = selectAllJobs(mockState as any);
      expect(jobs).toHaveLength(2);
    });

    it('should select job by id', () => {
      const job = selectJobById(mockState as any, 'job-1');
      expect(job).toEqual(mockJob);
    });

    it('should return undefined for non-existent job', () => {
      const job = selectJobById(mockState as any, 'non-existent');
      expect(job).toBeUndefined();
    });

    it('should select jobs filter', () => {
      const filter = selectJobsFilter(mockState as any);
      expect(filter.category).toBe('CONSTRUCTION');
      expect(filter.status).toBe('ACTIVE');
    });

    it('should select jobs loading', () => {
      expect(selectJobsLoading(mockState as any)).toBe(false);
    });

    it('should select jobs error', () => {
      expect(selectJobsError(mockState as any)).toBeNull();
    });

    it('should select jobs pagination', () => {
      const pagination = selectJobsPagination(mockState as any);
      expect(pagination.currentPage).toBe(1);
      expect(pagination.pageSize).toBe(20);
      expect(pagination.totalCount).toBe(2);
    });
  });
});

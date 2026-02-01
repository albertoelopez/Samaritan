import { createSlice, PayloadAction, createEntityAdapter } from '@reduxjs/toolkit';
import type { RootState } from '../../store/store';
import { Job, JobsState, JobFilter } from '../../types/job';

const jobsAdapter = createEntityAdapter<Job>({
  selectId: (job) => job.id,
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

const initialState: JobsState = jobsAdapter.getInitialState({
  filter: {
    category: null,
    location: null,
    priceRange: null,
    status: 'active',
    sortBy: 'createdAt',
  },
  selectedJobId: null,
  isLoading: false,
  error: null,
  lastFetch: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 20,
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    // Standard CRUD operations
    jobsReceived: (state, action: PayloadAction<{
      jobs: Job[];
      totalCount: number;
      page: number;
    }>) => {
      jobsAdapter.setMany(state, action.payload.jobs);
      state.totalCount = action.payload.totalCount;
      state.currentPage = action.payload.page;
      state.lastFetch = Date.now();
      state.isLoading = false;
    },
    
    jobAdded: jobsAdapter.addOne,
    jobUpdated: jobsAdapter.updateOne,
    jobRemoved: jobsAdapter.removeOne,
    
    // Real-time updates
    jobRealTimeUpdate: (state, action: PayloadAction<Job>) => {
      jobsAdapter.upsertOne(state, action.payload);
    },
    
    jobRealTimeRemove: (state, action: PayloadAction<string>) => {
      jobsAdapter.removeOne(state, action.payload);
    },
    
    // Filter and selection
    setJobFilter: (state, action: PayloadAction<Partial<JobFilter>>) => {
      state.filter = { ...state.filter, ...action.payload };
      state.currentPage = 1; // Reset to first page on filter change
    },
    
    selectJob: (state, action: PayloadAction<string | null>) => {
      state.selectedJobId = action.payload;
    },
    
    // Loading states
    setJobsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setJobsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    // Pagination
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // Optimistic updates
    optimisticJobUpdate: (state, action: PayloadAction<{
      id: string;
      changes: Partial<Job>;
    }>) => {
      const job = state.entities[action.payload.id];
      if (job) {
        jobsAdapter.updateOne(state, {
          id: action.payload.id,
          changes: {
            ...action.payload.changes,
            isOptimistic: true,
          },
        });
      }
    },
    
    // Clear optimistic updates
    clearOptimisticUpdate: (state, action: PayloadAction<string>) => {
      const job = state.entities[action.payload];
      if (job && job.isOptimistic) {
        jobsAdapter.updateOne(state, {
          id: action.payload,
          changes: { isOptimistic: false },
        });
      }
    },
  },
});

export const {
  jobsReceived,
  jobAdded,
  jobUpdated,
  jobRemoved,
  jobRealTimeUpdate,
  jobRealTimeRemove,
  setJobFilter,
  selectJob,
  setJobsLoading,
  setJobsError,
  setPage,
  optimisticJobUpdate,
  clearOptimisticUpdate,
} = jobsSlice.actions;

// Selectors
export const {
  selectAll: selectAllJobs,
  selectById: selectJobById,
  selectIds: selectJobIds,
} = jobsAdapter.getSelectors((state: RootState) => state.jobs);

export const selectJobsFilter = (state: RootState) => state.jobs.filter;
export const selectSelectedJobId = (state: RootState) => state.jobs.selectedJobId;
export const selectJobsLoading = (state: RootState) => state.jobs.isLoading;
export const selectJobsError = (state: RootState) => state.jobs.error;
export const selectJobsPagination = (state: RootState) => ({
  currentPage: state.jobs.currentPage,
  pageSize: state.jobs.pageSize,
  totalCount: state.jobs.totalCount,
});

export default jobsSlice.reducer;
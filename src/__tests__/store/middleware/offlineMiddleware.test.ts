/**
 * @jest-environment jsdom
 */
import { configureStore } from '@reduxjs/toolkit';
import { offlineMiddleware } from '../../../store/middleware/offlineMiddleware';

// Mock the offline queue service
jest.mock('../../../services/offline/offlineQueueService', () => ({
  offlineQueueService: {
    addToQueue: jest.fn(),
    processQueue: jest.fn(),
    getQueueLength: jest.fn(() => 0),
  },
}));

// Mock the app slice
jest.mock('../../../features/app/appSlice', () => ({
  setOnlineStatus: jest.fn((status: boolean) => ({
    type: 'app/setOnlineStatus',
    payload: status,
  })),
}));

import { offlineQueueService } from '../../../services/offline/offlineQueueService';

describe('offlineMiddleware', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Set online before creating store
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    store = configureStore({
      reducer: {
        test: (state = {}) => state,
        app: (state = { isOnline: true }) => state,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(offlineMiddleware),
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  it('should pass through regular actions', () => {
    const action = { type: 'TEST_ACTION', payload: 'test' };
    store.dispatch(action);

    expect(offlineQueueService.addToQueue).not.toHaveBeenCalled();
  });

  it('should queue API actions when offline', () => {
    // Set offline
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    // The middleware queues actions that end with /pending and match certain types
    const pendingAction = {
      type: 'jobs/createJob/pending',
      payload: { title: 'Test Job' },
    };

    store.dispatch(pendingAction);

    // Middleware wraps with timestamp and retries
    expect(offlineQueueService.addToQueue).toHaveBeenCalledWith(
      expect.objectContaining({
        action: pendingAction,
        timestamp: expect.any(Number),
        retries: 0,
      })
    );
  });

  it('should not queue non-queueable actions when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    // Non-queueable action type
    const nonQueueableAction = {
      type: 'auth/login/pending',
      payload: { email: 'test@example.com' },
    };

    store.dispatch(nonQueueableAction);

    expect(offlineQueueService.addToQueue).not.toHaveBeenCalled();
  });

  it('should process actions normally when online', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    const pendingAction = {
      type: 'jobs/createJob/pending',
      payload: { title: 'Test Job' },
    };

    store.dispatch(pendingAction);

    // When online, should not queue
    expect(offlineQueueService.addToQueue).not.toHaveBeenCalled();
  });
});

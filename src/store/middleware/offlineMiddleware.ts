import { Middleware } from '@reduxjs/toolkit';
import { offlineQueueService } from '../../services/offline/offlineQueueService';
import { setOnlineStatus } from '../../features/app/appSlice';

export const offlineMiddleware: Middleware = (store) => {
  // Monitor online/offline status
  window.addEventListener('online', () => {
    store.dispatch(setOnlineStatus(true));
    offlineQueueService.processQueue();
  });

  window.addEventListener('offline', () => {
    store.dispatch(setOnlineStatus(false));
  });

  return (next) => (action: any) => {
    // Check if this is an API call that should be queued when offline
    if (action.type?.endsWith('/pending') && !navigator.onLine) {
      const isQueueable = [
        'createJob',
        'updateJob',
        'sendMessage',
        'updateProfile',
      ].some(type => action.type.includes(type));

      if (isQueueable) {
        // Add to offline queue
        offlineQueueService.addToQueue({
          action,
          timestamp: Date.now(),
          retries: 0,
        });

        // Show offline notification
        return next({
          type: 'app/showOfflineNotification',
          payload: 'This action will be performed when you\'re back online',
        });
      }
    }

    return next(action);
  };
};
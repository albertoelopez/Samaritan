import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Feature slices
import authReducer from '../features/auth/authSlice';
import jobsReducer from '../features/jobs/jobsSlice';
import messagesReducer from '../features/messages/messagesSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import locationReducer from '../features/location/locationSlice';
import paymentReducer from '../features/payment/paymentSlice';

// API services
import { apiSlice } from '../services/api/apiSlice';
import { offlineMiddleware } from './middleware/offlineMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';
import { tokenRefreshMiddleware } from './middleware/tokenRefreshMiddleware';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'location'], // Only persist auth and location
  blacklist: ['api'], // Don't persist API cache
};

const rootReducer = combineReducers({
  auth: authReducer,
  jobs: jobsReducer,
  messages: messagesReducer,
  notifications: notificationsReducer,
  location: locationReducer,
  payment: paymentReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      apiSlice.middleware,
      offlineMiddleware,
      errorMiddleware,
      tokenRefreshMiddleware
    ),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
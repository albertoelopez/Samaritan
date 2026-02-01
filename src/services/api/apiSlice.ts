import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from '../../store/store';
import { tokenReceived, logout } from '../../features/auth/authSlice';
import { API_BASE_URL } from '../../utils/constants';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Base query with automatic retry for network failures
const baseQueryWithRetry = retry(baseQuery, { maxRetries: 3 });

// Base query with re-authentication
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQueryWithRetry(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to get a new token
    const refreshResult = await baseQuery('/auth/refresh', api, extraOptions);
    
    if (refreshResult.data) {
      const { accessToken } = refreshResult.data as { accessToken: string };
      // Store the new token
      api.dispatch(tokenReceived({ accessToken }));
      // Retry the original query
      result = await baseQueryWithRetry(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

// Define tags for cache invalidation
export const tagTypes = [
  'User',
  'Job',
  'Message',
  'Notification',
  'Payment',
  'Review',
  'Contractor',
  'Worker',
] as const;

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes,
  endpoints: (builder) => ({}),
});
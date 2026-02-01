import { apiSlice } from '../../services/api/apiSlice';
import { LoginCredentials, RegisterData, User } from '../../types/auth';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      { user: User; accessToken: string; refreshToken: string },
      LoginCredentials
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    register: builder.mutation<
      { user: User; accessToken: string; refreshToken: string },
      RegisterData
    >({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    
    refreshToken: builder.mutation<
      { accessToken: string },
      void
    >({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),
    
    verifyEmail: builder.mutation<void, { token: string }>({
      query: ({ token }) => ({
        url: `/auth/verify-email/${token}`,
        method: 'POST',
      }),
    }),
    
    resetPassword: builder.mutation<void, { email: string }>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    
    updatePassword: builder.mutation<
      void,
      { token: string; password: string }
    >({
      query: ({ token, password }) => ({
        url: `/auth/update-password/${token}`,
        method: 'POST',
        body: { password },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useVerifyEmailMutation,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
} = authApiSlice;
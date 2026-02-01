import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  tokenReceived,
  updateUser,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '../../../features/auth/authSlice';
import { User, AuthState } from '../../../types/auth';

describe('authSlice', () => {
  const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'worker',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle loginStart', () => {
      const actual = authReducer(initialState, loginStart());

      expect(actual.isLoading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('should handle loginSuccess', () => {
      const loadingState = { ...initialState, isLoading: true };
      const credentials = {
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      const actual = authReducer(loadingState, loginSuccess(credentials));

      expect(actual.user).toEqual(mockUser);
      expect(actual.accessToken).toBe('access-token');
      expect(actual.refreshToken).toBe('refresh-token');
      expect(actual.isAuthenticated).toBe(true);
      expect(actual.isLoading).toBe(false);
      expect(actual.error).toBeNull();
    });

    it('should handle loginFailure', () => {
      const loadingState = { ...initialState, isLoading: true };
      const errorMessage = 'Invalid credentials';

      const actual = authReducer(loadingState, loginFailure(errorMessage));

      expect(actual.isLoading).toBe(false);
      expect(actual.error).toBe(errorMessage);
      expect(actual.isAuthenticated).toBe(false);
    });

    it('should handle logout', () => {
      const authenticatedState: AuthState = {
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      const actual = authReducer(authenticatedState, logout());

      expect(actual.user).toBeNull();
      expect(actual.accessToken).toBeNull();
      expect(actual.refreshToken).toBeNull();
      expect(actual.isAuthenticated).toBe(false);
      expect(actual.error).toBeNull();
    });

    it('should handle tokenReceived', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        user: mockUser,
        accessToken: 'old-token',
        isAuthenticated: true,
      };

      const actual = authReducer(
        authenticatedState,
        tokenReceived({ accessToken: 'new-token' })
      );

      expect(actual.accessToken).toBe('new-token');
    });

    it('should handle updateUser', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        user: mockUser,
        accessToken: 'access-token',
        isAuthenticated: true,
      };

      const updates = { firstName: 'Updated' };
      const actual = authReducer(authenticatedState, updateUser(updates));

      expect(actual.user?.firstName).toBe('Updated');
      expect(actual.user?.lastName).toBe('User');
    });

    it('should not update user if no user exists', () => {
      const updates = { firstName: 'Updated' };
      const actual = authReducer(initialState, updateUser(updates));

      expect(actual.user).toBeNull();
    });
  });

  describe('selectors', () => {
    const mockState = {
      auth: {
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    };

    it('should select current user', () => {
      expect(selectCurrentUser(mockState as any)).toEqual(mockUser);
    });

    it('should select isAuthenticated', () => {
      expect(selectIsAuthenticated(mockState as any)).toBe(true);
    });

    it('should select auth loading', () => {
      expect(selectAuthLoading(mockState as any)).toBe(false);
    });

    it('should select auth error', () => {
      expect(selectAuthError(mockState as any)).toBeNull();
    });

    it('should select error when present', () => {
      const stateWithError = {
        auth: { ...mockState.auth, error: 'Test error' },
      };
      expect(selectAuthError(stateWithError as any)).toBe('Test error');
    });
  });
});

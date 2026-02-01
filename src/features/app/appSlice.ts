import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store/store';

interface AppState {
  isOnline: boolean;
  isInitialized: boolean;
  lastSync: string | null;
}

const initialState: AppState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isInitialized: false,
  lastSync: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setLastSync: (state, action: PayloadAction<string>) => {
      state.lastSync = action.payload;
    },
  },
});

export const { setOnlineStatus, setInitialized, setLastSync } = appSlice.actions;

export const selectIsOnline = (state: RootState) => state.app?.isOnline ?? true;
export const selectIsInitialized = (state: RootState) => state.app?.isInitialized ?? false;
export const selectLastSync = (state: RootState) => state.app?.lastSync ?? null;

export default appSlice.reducer;

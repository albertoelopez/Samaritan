import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// Types
interface Job {
  id: string
  title: string
  description: string
  category_id: string
  budget_min: number
  budget_max: number
  status: string
  city: string
  state: string
  created_at: string
}

interface JobsState {
  jobs: Job[]
  loading: boolean
  error: string | null
}

interface AuthState {
  user: { id: string; email: string; firstName: string; lastName: string; role: string } | null
  token: string | null
  loading: boolean
  error: string | null
}

// Async thunks
export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
  const response = await fetch('/api/v1/jobs')
  const data = await response.json()
  return data.data.jobs
})

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.message || 'Login failed')
    }
    return data.data
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; firstName: string; lastName: string; role: string }, { rejectWithValue }) => {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.message || 'Registration failed')
    }
    return data.data
  }
)

// Jobs slice
const jobsSlice = createSlice({
  name: 'jobs',
  initialState: { jobs: [], loading: false, error: null } as JobsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.loading = false
        state.jobs = action.payload
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch jobs'
      })
  },
})

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: false, error: null } as AuthState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.accessToken
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.accessToken
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { logout } = authSlice.actions

export const store = configureStore({
  reducer: {
    jobs: jobsSlice.reducer,
    auth: authSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

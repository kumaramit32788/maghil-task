import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Authentication state interface
 */
interface AuthState {
  isAuthenticated: boolean
  token: string | null
  loading: boolean
  error: string | null
}

/**
 * Initial authentication state
 */
const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null,
}

/**
 * Authentication slice
 * Handles login state, token management, and authentication status
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Login request action
     * Triggered when user attempts to login
     */
    loginRequest: (state, action: PayloadAction<{ username: string; password: string }>) => {
      state.loading = true
      state.error = null
    },
    /**
     * Login success action
     * Called by saga after successful authentication
     */
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.isAuthenticated = true
      state.token = action.payload
      state.error = null
    },
    /**
     * Login failure action
     * Called by saga when authentication fails
     */
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.isAuthenticated = false
      state.token = null
      state.error = action.payload
    },
    /**
     * Logout action
     * Clears authentication state and session
     */
    logout: (state) => {
      state.isAuthenticated = false
      state.token = null
      state.error = null
      state.loading = false
    },
    /**
     * Check authentication from AsyncStorage
     * Used on app initialization
     * Note: This is handled by saga, this reducer just sets the state
     */
    setAuthFromStorage: (state, action: PayloadAction<string | null>) => {
      if (action.payload) {
        state.isAuthenticated = true
        state.token = action.payload
      } else {
        state.isAuthenticated = false
        state.token = null
      }
    },
  },
})

export const { loginRequest, loginSuccess, loginFailure, logout, setAuthFromStorage } = authSlice.actions
export default authSlice.reducer


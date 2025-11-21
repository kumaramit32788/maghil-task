import { call, put, takeLatest } from 'redux-saga/effects'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { loginRequest, loginSuccess, loginFailure, setAuthFromStorage } from '../slices/authSlice'

/**
 * Hardcoded credentials for authentication
 */
const HARDCODED_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
}

/**
 * Simulates authentication API call
 * In a real app, this would be an actual API request
 * 
 * @param username - User's username
 * @param password - User's password
 * @returns Promise resolving to a token string
 */
function* authenticateUser(username: string, password: string) {
  // Simulate API delay
  yield new Promise((resolve) => setTimeout(resolve, 500))

  // Check credentials
  if (username === HARDCODED_CREDENTIALS.username && password === HARDCODED_CREDENTIALS.password) {
    // Generate a dummy token
    const token = `dummy_token_${Date.now()}`
    return token
  } else {
    throw new Error('Invalid username or password')
  }
}

/**
 * Login saga worker
 * Handles login authentication flow
 * 
 * @param action - Login request action with username and password
 */
function* loginSaga(action: ReturnType<typeof loginRequest>) {
  try {
    const { username, password } = action.payload

    // Call authentication function
    const token: string = yield call(authenticateUser, username, password)

    // Store token in AsyncStorage
    yield call(AsyncStorage.setItem, 'authToken', token)

    // Dispatch success action
    yield put(loginSuccess(token))
  } catch (error) {
    // Dispatch failure action with error message
    yield put(loginFailure(error instanceof Error ? error.message : 'Login failed'))
  }
}

/**
 * Check auth saga worker
 * Loads authentication token from AsyncStorage on app initialization
 */
function* checkAuthSaga() {
  try {
    const token: string | null = yield call(AsyncStorage.getItem, 'authToken')
    yield put(setAuthFromStorage(token))
  } catch (error) {
    console.error('Error checking auth:', error)
    yield put(setAuthFromStorage(null))
  }
}

/**
 * Logout saga worker
 * Clears authentication token from AsyncStorage
 */
function* logoutSaga() {
  try {
    yield call(AsyncStorage.removeItem, 'authToken')
  } catch (error) {
    console.error('Error during logout:', error)
  }
}

/**
 * Auth saga watchers
 * Listen for auth-related actions
 */
export function* watchLogin() {
  yield takeLatest(loginRequest.type, loginSaga)
}

export function* watchCheckAuth() {
  yield takeLatest('auth/checkAuth', checkAuthSaga)
}

export function* watchLogout() {
  yield takeLatest('auth/logout', logoutSaga)
}


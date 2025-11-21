import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './sagas/rootSaga'
import authReducer from './slices/authSlice'
import cryptoReducer from './slices/cryptoSlice'
import portfolioReducer from './slices/portfolioSlice'

/**
 * Redux-Saga middleware for handling side effects
 */
const sagaMiddleware = createSagaMiddleware()

/**
 * Redux store configuration
 * Combines all reducers and applies saga middleware
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    crypto: cryptoReducer,
    portfolio: portfolioReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['crypto/fetchCryptoData/pending'],
      },
    }).concat(sagaMiddleware),
})

// Run root saga
sagaMiddleware.run(rootSaga)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


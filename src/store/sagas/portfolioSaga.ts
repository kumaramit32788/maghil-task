import { call, put, takeLatest, select } from 'redux-saga/effects'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  addToPortfolioRequest,
  addToPortfolioSuccess,
  updatePortfolioItemRequest,
  updatePortfolioItemSuccess,
  removeFromPortfolio,
  portfolioFailure,
  loadPortfolioFromStorage,
  PortfolioItem,
} from '../slices/portfolioSlice'
import type { RootState } from '../store'
import type { Coin } from '../slices/cryptoSlice'

/**
 * Saves portfolio to AsyncStorage
 * 
 * @param items - Array of portfolio items to save
 */
function* savePortfolioToStorage(items: PortfolioItem[]) {
  try {
    yield call(AsyncStorage.setItem, 'portfolio', JSON.stringify(items))
  } catch (error) {
    throw new Error('Failed to save portfolio to AsyncStorage')
  }
}

/**
 * Add to portfolio saga worker
 * Handles adding a coin to the user's portfolio
 * 
 * @param action - Add to portfolio request action with coin and quantity
 */
function* addToPortfolioSaga(action: ReturnType<typeof addToPortfolioRequest>) {
  try {
    const { coin, quantity } = action.payload

    // Calculate value
    const value = coin.current_price * quantity

    // Create portfolio item
    const portfolioItem: PortfolioItem = {
      coinId: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.image,
      quantity,
      currentPrice: coin.current_price,
      value,
    }

    // Get current portfolio state
    const currentItems: PortfolioItem[] = yield select(
      (state: RootState) => state.portfolio.items
    )

    // Check if coin already exists
    const existingIndex = currentItems.findIndex((item) => item.coinId === coin.id)
    let updatedItems: PortfolioItem[]

    if (existingIndex >= 0) {
      // Update existing item
      updatedItems = [...currentItems]
      updatedItems[existingIndex] = portfolioItem
    } else {
      // Add new item
      updatedItems = [...currentItems, portfolioItem]
    }

    // Save to AsyncStorage
    yield call(savePortfolioToStorage, updatedItems)

    // Dispatch success action
    yield put(addToPortfolioSuccess(portfolioItem))
  } catch (error) {
    // Dispatch failure action
    yield put(portfolioFailure(error instanceof Error ? error.message : 'Failed to add to portfolio'))
  }
}

/**
 * Update portfolio item saga worker
 * Handles updating quantity of a portfolio item
 * 
 * @param action - Update portfolio item request action with coinId and quantity
 */
function* updatePortfolioItemSaga(action: ReturnType<typeof updatePortfolioItemRequest>) {
  try {
    const { coinId, quantity } = action.payload

    // Get current portfolio state
    const currentItems: PortfolioItem[] = yield select(
      (state: RootState) => state.portfolio.items
    )

    // Find the item to update
    const itemIndex = currentItems.findIndex((item) => item.coinId === coinId)
    if (itemIndex < 0) {
      throw new Error('Portfolio item not found')
    }

    const item = currentItems[itemIndex]

    // Get current price from crypto state
    const coins: Coin[] = yield select((state: RootState) => state.crypto.coins)
    const coin = coins.find((c) => c.id === coinId)

    if (!coin) {
      throw new Error('Coin not found in crypto data')
    }

    // Update item
    const updatedItem: PortfolioItem = {
      ...item,
      quantity,
      currentPrice: coin.current_price,
      value: coin.current_price * quantity,
    }

    // Update items array
    const updatedItems = [...currentItems]
    updatedItems[itemIndex] = updatedItem

    // Save to AsyncStorage
    yield call(savePortfolioToStorage, updatedItems)

    // Dispatch success action
    yield put(updatePortfolioItemSuccess(updatedItem))
  } catch (error) {
    // Dispatch failure action
    yield put(portfolioFailure(error instanceof Error ? error.message : 'Failed to update portfolio item'))
  }
}

/**
 * Remove from portfolio saga worker
 * Handles removing a coin from portfolio and updating localStorage
 * 
 * @param action - Remove from portfolio action with coinId
 */
function* removeFromPortfolioSaga(action: ReturnType<typeof removeFromPortfolio>) {
  try {
    const coinId = action.payload

    // Get current portfolio state
    const currentItems: PortfolioItem[] = yield select(
      (state: RootState) => state.portfolio.items
    )

    // Filter out the removed item
    const updatedItems = currentItems.filter((item) => item.coinId !== coinId)

    // Save to AsyncStorage
    yield call(savePortfolioToStorage, updatedItems)
  } catch (error) {
    console.error('Error removing from portfolio:', error)
  }
}

/**
 * Portfolio saga watchers
 * Listen for portfolio-related actions
 */
export function* watchAddToPortfolio() {
  yield takeLatest(addToPortfolioRequest.type, addToPortfolioSaga)
}

export function* watchUpdatePortfolioItem() {
  yield takeLatest(updatePortfolioItemRequest.type, updatePortfolioItemSaga)
}

export function* watchRemoveFromPortfolio() {
  yield takeLatest(removeFromPortfolio.type, removeFromPortfolioSaga)
}

/**
 * Load portfolio from storage saga worker
 * Loads portfolio data from AsyncStorage on app initialization
 */
function* loadPortfolioFromStorageSaga() {
  try {
    const stored: string | null = yield call(AsyncStorage.getItem, 'portfolio')
    const items: PortfolioItem[] = stored ? JSON.parse(stored) : []
    yield put(loadPortfolioFromStorage(items))
  } catch (error) {
    console.error('Error loading portfolio from storage:', error)
    yield put(loadPortfolioFromStorage([]))
  }
}

export function* watchLoadPortfolioFromStorage() {
  yield takeLatest('portfolio/loadPortfolioFromStorage', loadPortfolioFromStorageSaga)
}


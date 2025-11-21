import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Coin } from './cryptoSlice'

/**
 * Portfolio item interface
 * Represents a coin in the user's portfolio
 */
export interface PortfolioItem {
  coinId: string
  name: string
  symbol: string
  image: string
  quantity: number
  currentPrice: number
  value: number
}

/**
 * Portfolio state interface
 */
interface PortfolioState {
  items: PortfolioItem[]
  loading: boolean
  error: string | null
}

/**
 * Initial portfolio state
 * Note: Loading from AsyncStorage is handled by saga on app initialization
 */
const initialState: PortfolioState = {
  items: [],
  loading: false,
  error: null,
}

/**
 * Portfolio slice
 * Manages user's cryptocurrency portfolio with localStorage persistence
 */
const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    /**
     * Add coin to portfolio request
     * Triggered when user clicks "Add to Portfolio"
     */
    addToPortfolioRequest: (state, action: PayloadAction<{ coin: Coin; quantity: number }>) => {
      state.loading = true
      state.error = null
    },
    /**
     * Add coin to portfolio success
     * Called by saga after adding coin
     */
    addToPortfolioSuccess: (state, action: PayloadAction<PortfolioItem>) => {
      state.loading = false
      const existingIndex = state.items.findIndex(
        (item) => item.coinId === action.payload.coinId
      )
      if (existingIndex >= 0) {
        // Update existing item
        state.items[existingIndex] = action.payload
      } else {
        // Add new item
        state.items.push(action.payload)
      }
      state.error = null
    },
    /**
     * Update portfolio item quantity
     * Triggered when user edits quantity
     */
    updatePortfolioItemRequest: (
      state,
      action: PayloadAction<{ coinId: string; quantity: number }>
    ) => {
      state.loading = true
      state.error = null
    },
    /**
     * Update portfolio item success
     * Called by saga after updating quantity
     */
    updatePortfolioItemSuccess: (state, action: PayloadAction<PortfolioItem>) => {
      state.loading = false
      const index = state.items.findIndex((item) => item.coinId === action.payload.coinId)
      if (index >= 0) {
        state.items[index] = action.payload
      }
      state.error = null
    },
    /**
     * Remove coin from portfolio
     * Triggered when user removes a coin
     */
    removeFromPortfolio: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.coinId !== action.payload)
    },
    /**
     * Update portfolio prices
     * Called when crypto data is refreshed to update portfolio values
     */
    updatePortfolioPrices: (state, action: PayloadAction<{ [key: string]: number }>) => {
      state.items = state.items.map((item) => {
        const newPrice = action.payload[item.coinId]
        if (newPrice !== undefined) {
          return {
            ...item,
            currentPrice: newPrice,
            value: item.quantity * newPrice,
          }
        }
        return item
      })
    },
    /**
     * Portfolio operation failure
     * Called by saga when portfolio operation fails
     */
    portfolioFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    /**
     * Load portfolio from storage
     * Called by saga on app initialization
     */
    loadPortfolioFromStorage: (state, action: PayloadAction<PortfolioItem[]>) => {
      state.items = action.payload
    },
  },
})

export const {
  addToPortfolioRequest,
  addToPortfolioSuccess,
  updatePortfolioItemRequest,
  updatePortfolioItemSuccess,
  removeFromPortfolio,
  updatePortfolioPrices,
  portfolioFailure,
  loadPortfolioFromStorage,
} = portfolioSlice.actions
export default portfolioSlice.reducer


import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Coin data interface from CoinGecko API
 */
export interface Coin {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
}

/**
 * Crypto state interface
 */
interface CryptoState {
  coins: Coin[]
  loading: boolean
  error: string | null
  lastUpdated: number | null
  refreshing: { [key: string]: boolean }
}

/**
 * Initial crypto state
 */
const initialState: CryptoState = {
  coins: [],
  loading: false,
  error: null,
  lastUpdated: null,
  refreshing: {},
}

/**
 * Crypto slice
 * Manages cryptocurrency data, loading states, and refresh status
 */
const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    /**
     * Fetch crypto data request
     * Triggered to fetch top 10 coins from CoinGecko
     */
    fetchCryptoDataRequest: (state) => {
      state.loading = true
      state.error = null
    },
    /**
     * Fetch crypto data success
     * Called by saga after successful API call
     */
    fetchCryptoDataSuccess: (state, action: PayloadAction<Coin[]>) => {
      state.loading = false
      state.coins = action.payload
      state.lastUpdated = Date.now()
      state.error = null
    },
    /**
     * Fetch crypto data failure
     * Called by saga when API call fails
     */
    fetchCryptoDataFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    /**
     * Start refresh polling
     * Initiates automatic data refresh every 60 seconds
     */
    startRefreshPolling: (state) => {
      // Polling state managed by saga
    },
    /**
     * Stop refresh polling
     * Stops automatic data refresh
     */
    stopRefreshPolling: (state) => {
      // Polling state managed by saga
    },
    /**
     * Set coin refreshing state
     * Used for per-coin loading indicators
     */
    setCoinRefreshing: (state, action: PayloadAction<{ coinId: string; refreshing: boolean }>) => {
      state.refreshing[action.payload.coinId] = action.payload.refreshing
    },
  },
})

export const {
  fetchCryptoDataRequest,
  fetchCryptoDataSuccess,
  fetchCryptoDataFailure,
  startRefreshPolling,
  stopRefreshPolling,
  setCoinRefreshing,
} = cryptoSlice.actions
export default cryptoSlice.reducer


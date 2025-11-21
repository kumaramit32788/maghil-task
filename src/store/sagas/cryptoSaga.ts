import { call, put, takeLatest, delay, select } from 'redux-saga/effects'
import {
  fetchCryptoDataRequest,
  fetchCryptoDataSuccess,
  fetchCryptoDataFailure,
  startRefreshPolling,
  setCoinRefreshing,
} from '../slices/cryptoSlice'
import { updatePortfolioPrices } from '../slices/portfolioSlice'
import type { RootState } from '../store'

/**
 * CoinGecko API endpoint for fetching top 10 cryptocurrencies
 */
const COINGECKO_API_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1'

/**
 * Fetches cryptocurrency data from CoinGecko API
 * 
 * @returns Promise resolving to array of coin data
 */
async function fetchCryptoData() {
  const response = await fetch(COINGECKO_API_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch crypto data: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Fetch crypto data saga worker
 * Handles API call to fetch top 10 cryptocurrencies
 */
function* fetchCryptoDataSaga() {
  try {
    // Call API
    const coins = yield call(fetchCryptoData)

    // Dispatch success action with coin data
    yield put(fetchCryptoDataSuccess(coins))

    // Update portfolio prices if portfolio exists
    const portfolioItems = yield select((state: RootState) => state.portfolio.items)
    if (portfolioItems.length > 0) {
      const priceMap: { [key: string]: number } = {}
      coins.forEach((coin: any) => {
        priceMap[coin.id] = coin.current_price
      })
      yield put(updatePortfolioPrices(priceMap))
    }
  } catch (error) {
    // Dispatch failure action with error message
    yield put(
      fetchCryptoDataFailure(error instanceof Error ? error.message : 'Failed to fetch crypto data')
    )
  }
}

/**
 * Refresh polling saga worker
 * Automatically refreshes crypto data every 60 seconds
 */
function* refreshPollingSaga() {
  while (true) {
    try {
      // Wait 60 seconds
      yield delay(60000)

      // Fetch fresh data
      yield put(fetchCryptoDataRequest())
    } catch (error) {
      console.error('Error in refresh polling:', error)
    }
  }
}

/**
 * Start refresh polling saga
 * Initiates automatic data refresh
 */
function* startRefreshPollingSaga() {
  yield refreshPollingSaga()
}

/**
 * Crypto saga watchers
 * Listen for crypto-related actions
 */
export function* watchFetchCryptoData() {
  yield takeLatest(fetchCryptoDataRequest.type, fetchCryptoDataSaga)
}

export function* watchStartRefreshPolling() {
  yield takeLatest(startRefreshPolling.type, startRefreshPollingSaga)
}


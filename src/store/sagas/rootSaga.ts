import { all } from 'redux-saga/effects'
import { watchLogin, watchCheckAuth, watchLogout } from './authSaga'
import { watchFetchCryptoData, watchStartRefreshPolling } from './cryptoSaga'
import {
  watchAddToPortfolio,
  watchUpdatePortfolioItem,
  watchRemoveFromPortfolio,
  watchLoadPortfolioFromStorage,
} from './portfolioSaga'

/**
 * Root saga
 * Combines all saga watchers to run concurrently
 */
export default function* rootSaga() {
  yield all([
    // Auth sagas
    watchLogin(),
    watchCheckAuth(),
    watchLogout(),
    // Crypto sagas
    watchFetchCryptoData(),
    watchStartRefreshPolling(),
    // Portfolio sagas
    watchAddToPortfolio(),
    watchUpdatePortfolioItem(),
    watchRemoveFromPortfolio(),
    watchLoadPortfolioFromStorage(),
  ])
}


import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import {
  fetchCryptoDataRequest,
  startRefreshPolling,
} from '../store/slices/cryptoSlice'
import { addToPortfolioRequest } from '../store/slices/portfolioSlice'
import { logout } from '../store/slices/authSlice'
import { GlobalLoader, CoinLoader } from '../components/Loader'
import { ErrorDisplay } from '../components/ErrorDisplay'
import type { RootState } from '../store/store'
import type { Coin } from '../store/slices/cryptoSlice'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type RootStackParamList = {
  Login: undefined
  Dashboard: undefined
  Portfolio: undefined
}

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>

/**
 * Dashboard page component
 * Displays top 10 cryptocurrencies with real-time data and auto-refresh
 */
const Dashboard: React.FC = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation<DashboardScreenNavigationProp>()
  const { coins, loading, error, lastUpdated, refreshing } = useSelector(
    (state: RootState) => state.crypto
  )

  const [quantity, setQuantity] = useState<{ [key: string]: string }>({})

  // Fetch initial data and start polling on mount
  useEffect(() => {
    dispatch(fetchCryptoDataRequest())
    dispatch(startRefreshPolling())
  }, [dispatch])

  /**
   * Handles logout
   * Clears session and redirects to login
   */
  const handleLogout = () => {
    dispatch(logout())
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    })
  }

  /**
   * Handles adding coin to portfolio
   * 
   * @param coin - Coin to add to portfolio
   */
  const handleAddToPortfolio = (coin: Coin) => {
    const qty = parseFloat(quantity[coin.id] || '1')
    if (qty > 0) {
      dispatch(addToPortfolioRequest({ coin, quantity: qty }))
      setQuantity({ ...quantity, [coin.id]: '' })
      navigation.navigate('Portfolio')
    }
  }

  /**
   * Formats number as currency
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  /**
   * Formats large numbers with abbreviations
   */
  const formatMarketCap = (value: number): string => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return formatCurrency(value)
  }

  /**
   * Formats percentage change with color
   */
  const formatPercentage = (value: number): { text: string; color: string } => {
    const formatted = `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
    const color = value >= 0 ? '#16a34a' : '#dc2626'
    return { text: formatted, color }
  }

  return (
    <View style={styles.container}>
      {loading && <GlobalLoader />}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crypto Dashboard</Text>
        <View style={styles.headerActions}>
          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              {new Date(lastUpdated).toLocaleTimeString()}
            </Text>
          )}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Portfolio')}
          >
            <Text style={styles.headerButtonText}>Portfolio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.headerButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => dispatch(fetchCryptoDataRequest())}
          />
        }
      >
        {error && <ErrorDisplay message={error} />}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Top 10 Cryptocurrencies</Text>
            <Text style={styles.cardSubtitle}>Auto-refreshes every 60 seconds</Text>
          </View>

          {coins.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No data available</Text>
            </View>
          ) : (
            <View style={styles.coinList}>
              {coins.map((coin, index) => {
                const percentage = formatPercentage(coin.price_change_percentage_24h)
                return (
                  <View key={coin.id} style={styles.coinRow}>
                    <View style={styles.coinInfo}>
                      <Text style={styles.rank}>{index + 1}</Text>
                      <Image source={{ uri: coin.image }} style={styles.coinImage} />
                      <View style={styles.coinDetails}>
                        <Text style={styles.coinName}>{coin.name}</Text>
                        <Text style={styles.coinSymbol}>{coin.symbol.toUpperCase()}</Text>
                      </View>
                      {refreshing[coin.id] && <CoinLoader />}
                    </View>

                    <View style={styles.coinData}>
                      <Text style={styles.price}>{formatCurrency(coin.current_price)}</Text>
                      <Text style={[styles.percentage, { color: percentage.color }]}>
                        {percentage.text}
                      </Text>
                      <Text style={styles.marketCap}>{formatMarketCap(coin.market_cap)}</Text>
                    </View>

                    <View style={styles.portfolioActions}>
                      <TextInput
                        style={styles.quantityInput}
                        value={quantity[coin.id] || ''}
                        onChangeText={(text) => setQuantity({ ...quantity, [coin.id]: text })}
                        placeholder="Qty"
                        keyboardType="decimal-pad"
                        placeholderTextColor="#9ca3af"
                      />
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddToPortfolio(coin)}
                      >
                        <Text style={styles.addButtonText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
  },
  headerButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    marginRight: 16,
  },
  headerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  coinList: {
    padding: 8,
  },
  coinRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  coinInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    width: 24,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  coinImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  coinDetails: {
    flex: 1,
  },
  coinName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a202c',
  },
  coinSymbol: {
    fontSize: 12,
    color: '#6b7280',
  },
  coinData: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a202c',
  },
  percentage: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  marketCap: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  portfolioActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 6,
    fontSize: 12,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
})

export default Dashboard

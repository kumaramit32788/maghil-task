import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import {
  updatePortfolioItemRequest,
  removeFromPortfolio,
} from '../store/slices/portfolioSlice'
import { logout } from '../store/slices/authSlice'
import { GlobalLoader } from '../components/Loader'
import { ErrorDisplay } from '../components/ErrorDisplay'
import type { RootState } from '../store/store'
import type { PortfolioItem } from '../store/slices/portfolioSlice'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type RootStackParamList = {
  Login: undefined
  Dashboard: undefined
  Portfolio: undefined
}

type PortfolioScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Portfolio'>

/**
 * Portfolio page component
 * Displays user's cryptocurrency portfolio with editable quantities
 */
const Portfolio: React.FC = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation<PortfolioScreenNavigationProp>()
  const { items, loading, error } = useSelector((state: RootState) => state.portfolio)

  const [editingQuantity, setEditingQuantity] = useState<{ [key: string]: string }>({})
  const initializedItemsRef = useRef<Set<string>>(new Set())
  const previousItemsLengthRef = useRef<number>(0)

  // Initialize editing quantities from current items (only for new items, not on quantity updates)
  useEffect(() => {
    // Only run if new items were added (length increased) or on initial load
    const currentItemsLength = items.length
    const hasNewItems = currentItemsLength > previousItemsLengthRef.current
    
    if (hasNewItems || previousItemsLengthRef.current === 0) {
      setEditingQuantity((prev) => {
        const updated: { [key: string]: string } = { ...prev }
        items.forEach((item) => {
          // Only initialize if this is a new item we haven't seen before
          if (!initializedItemsRef.current.has(item.coinId)) {
            updated[item.coinId] = item.quantity.toString()
            initializedItemsRef.current.add(item.coinId)
          }
        })
        return updated
      })
      previousItemsLengthRef.current = currentItemsLength
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  // Sync editingQuantity with Redux state when quantities change
  // Only update if the input is empty (was cleared) to show updated quantity
  useEffect(() => {
    setEditingQuantity((prev) => {
      const updated: { [key: string]: string } = { ...prev }
      let hasChanges = false
      
      items.forEach((item) => {
        if (initializedItemsRef.current.has(item.coinId)) {
          const currentEditingValue = prev[item.coinId]
          const currentQuantityStr = item.quantity.toString()
          
          // Only update if input is empty (user cleared it or it was reset)
          // This ensures we sync after updates without overwriting active user input
          if (currentEditingValue === '' || currentEditingValue === undefined) {
            updated[item.coinId] = currentQuantityStr
            hasChanges = true
          }
        }
      })
      
      return hasChanges ? updated : prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((item) => `${item.coinId}:${item.quantity}`).join(',')])

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
   * Handles quantity update
   * Adds the new quantity to the existing quantity
   * 
   * @param coinId - ID of the coin to update
   */
  const handleUpdateQuantity = (coinId: string) => {
    const newQty = parseFloat(editingQuantity[coinId] || '0')
    if (newQty > 0) {
      const currentItem = items.find((item) => item.coinId === coinId)
      if (currentItem) {
        const totalQuantity = currentItem.quantity + newQty
        dispatch(updatePortfolioItemRequest({ coinId, quantity: totalQuantity }))
        // Update the input to show the new total quantity
        setEditingQuantity((prev) => {
          const updated = { ...prev }
          updated[coinId] = totalQuantity.toString()
          return updated
        })
      }
    }
  }

  /**
   * Handles removing coin from portfolio
   * 
   * @param coinId - ID of the coin to remove
   */
  const handleRemove = (coinId: string) => {
    Alert.alert(
      'Remove Coin',
      'Are you sure you want to remove this coin from your portfolio?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(removeFromPortfolio(coinId)),
        },
      ]
    )
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
   * Calculates total portfolio value
   */
  const totalValue = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <View style={styles.container}>
      {loading && <GlobalLoader />}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Portfolio</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.headerButtonText}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.headerButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {error && <ErrorDisplay message={error} />}

        {/* Total Portfolio Value */}
        <View style={styles.totalValueCard}>
          <Text style={styles.totalValueLabel}>Total Portfolio Value</Text>
          <Text style={styles.totalValueAmount}>{formatCurrency(totalValue)}</Text>
        </View>

        {/* Portfolio Items */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Portfolio Items</Text>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Your portfolio is empty.</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Dashboard')}
              >
                <Text style={styles.emptyButtonText}>Add Coins to Portfolio</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.portfolioList}>
              {items.map((item) => (
                <View key={item.coinId} style={styles.portfolioRow}>
                  <View style={styles.coinInfo}>
                    <Image source={{ uri: item.image }} style={styles.coinImage} />
                    <View style={styles.coinDetails}>
                      <Text style={styles.coinName}>{item.name}</Text>
                      <Text style={styles.coinSymbol}>{item.symbol.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.coinData}>
                    <Text style={styles.price}>{formatCurrency(item.currentPrice)}</Text>
                    <View style={styles.quantityContainer}>
                      <Text style={styles.quantityLabel}>Quantity:</Text>
                      <TextInput
                        style={styles.quantityInput}
                        value={editingQuantity[item.coinId] ?? item.quantity.toString()}
                        onChangeText={(text) => {
                          setEditingQuantity((prev) => ({
                            ...prev,
                            [item.coinId]: text,
                          }))
                        }}
                        keyboardType="decimal-pad"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                    <Text style={styles.value}>{formatCurrency(item.value)}</Text>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={() => handleUpdateQuantity(item.coinId)}
                    >
                      <Text style={styles.updateButtonText}>Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemove(item.coinId)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
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
    padding: 16,
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
  headerButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
  },
  headerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  totalValueCard: {
    backgroundColor: '#667eea',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  totalValueLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  totalValueAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
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
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  portfolioList: {
    padding: 8,
  },
  portfolioRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 12,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  quantityLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
})

export default Portfolio

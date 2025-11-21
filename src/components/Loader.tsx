import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'

/**
 * Global loader component
 * Displays a full-screen loading spinner
 */
export const GlobalLoader: React.FC = () => {
  return (
    <View style={styles.globalLoader}>
      <ActivityIndicator size="large" color="#3498db" />
    </View>
  )
}

/**
 * Small inline loader component
 * Used for per-component loading states
 */
export const InlineLoader: React.FC = () => {
  return (
    <View style={styles.inlineLoader}>
      <ActivityIndicator size="small" color="#3498db" />
    </View>
  )
}

/**
 * Coin-specific loader component
 * Used when refreshing individual coin data
 */
export const CoinLoader: React.FC = () => {
  return (
    <View style={styles.coinLoader}>
      <ActivityIndicator size="small" color="#3498db" />
    </View>
  )
}

const styles = StyleSheet.create({
  globalLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  inlineLoader: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinLoader: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

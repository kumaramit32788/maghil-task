import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

/**
 * Error display component
 * Shows error messages in a user-friendly format
 * 
 * @param message - Error message to display
 * @param onDismiss - Optional callback to dismiss the error
 */
interface ErrorDisplayProps {
  message: string
  onDismiss?: () => void
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onDismiss }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fee',
    borderColor: '#fcc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    color: '#c33',
    flex: 1,
    fontSize: 14,
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
  dismissText: {
    color: '#c33',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

/**
 * Crypto Portfolio Tracker - React Native App
 * Main app component with navigation setup
 */

import React, { useEffect } from 'react'
import { StatusBar, useColorScheme } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { store, RootState } from './src/store/store'
import Login from './src/pages/Login'
import Dashboard from './src/pages/Dashboard'
import Portfolio from './src/pages/Portfolio'

const Stack = createNativeStackNavigator()

/**
 * App content with navigation
 * Handles routing and authentication checks
 */
function AppContent() {
  const dispatch = useDispatch()
  const isDarkMode = useColorScheme() === 'dark'
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  // Check authentication and load portfolio on app start
  useEffect(() => {
    dispatch({ type: 'auth/checkAuth' })
    dispatch({ type: 'portfolio/loadPortfolioFromStorage' })
  }, [dispatch])

  return (
    <NavigationContainer>
      <StatusBar hidden={true} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={isAuthenticated ? 'Dashboard' : 'Login'}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Portfolio" component={Portfolio} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

/**
 * Main App component
 * Wraps app with Redux Provider and SafeAreaProvider
 */
function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  )
}

export default App

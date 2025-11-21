# Crypto Portfolio Tracker - React Native

A real-time cryptocurrency portfolio tracking application built with React Native, TypeScript, Redux Toolkit, and Redux-Saga.

## Features

### 🔐 Authentication
- Session-based login system using AsyncStorage
- Hardcoded credentials: `admin` / `admin123`
- Automatic session persistence across app restarts
- Protected navigation that redirects to login if not authenticated

### 📊 Crypto Dashboard
- Displays top 10 cryptocurrencies from CoinGecko API
- Real-time price updates with automatic refresh every 60 seconds
- Shows coin information:
  - Coin name and symbol
  - Logo
  - Current price (USD)
  - 24-hour percentage change
  - Market capitalization
- Global loader during initial data fetch
- Per-coin loading indicators during refresh
- Error handling with user-friendly error messages
- Pull-to-refresh functionality

### 💼 Portfolio Management
- Add coins to portfolio with custom quantities
- Edit quantities of existing portfolio items
- Remove coins from portfolio
- View total portfolio value
- Real-time price updates for portfolio items
- Data persisted in AsyncStorage

## Tech Stack

- **React Native 0.82** - Mobile UI framework
- **TypeScript** - Type-safe development
- **Redux Toolkit** - State management
- **Redux-Saga** - Side effect management (API calls, polling, AsyncStorage)
- **React Navigation** - Native navigation
- **AsyncStorage** - Data persistence

## Prerequisites

Before running the app, make sure you have:

1. **Node.js** >= 20
2. **npm** or **yarn**
3. **React Native development environment** set up:
   - For **Android**: Android Studio, JDK, Android SDK
   - For **iOS** (macOS only): Xcode, CocoaPods

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **For iOS (macOS only):**
   ```bash
   cd ios
   pod install
   cd ..
   ```

## Running the App

### Start Metro Bundler

First, start the Metro bundler in a terminal:

```bash
npm start
```

Or:

```bash
npx react-native start
```

### Run on Android

In a new terminal window:

```bash
npm run android
```

Or:

```bash
npx react-native run-android
```

**Note:** Make sure you have:
- An Android emulator running, OR
- A physical Android device connected via USB with USB debugging enabled

### Run on iOS (macOS only)

In a new terminal window:

```bash
npm run ios
```

Or:

```bash
npx react-native run-ios
```

**Note:** Make sure you have:
- Xcode installed
- iOS Simulator available, OR
- A physical iOS device connected

## Usage

### Login
1. Open the app
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Tap "Login" to authenticate

### Dashboard
- View top 10 cryptocurrencies
- Data automatically refreshes every 60 seconds
- Pull down to manually refresh
- Add coins to portfolio by entering a quantity and tapping "Add"

### Portfolio
- View all coins in your portfolio
- Edit quantities by changing the value and tapping "Update"
- Remove coins by tapping "Remove"
- View total portfolio value at the top

## API Integration

The application uses the CoinGecko API:

**Endpoint:**
```
GET https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1
```

## Troubleshooting

### Android Issues

1. **"SDK location not found"**
   - Set `ANDROID_HOME` environment variable
   - Add to `~/.bashrc` or `~/.zshrc`:
     ```bash
     export ANDROID_HOME=$HOME/Library/Android/sdk
     export PATH=$PATH:$ANDROID_HOME/emulator
     export PATH=$PATH:$ANDROID_HOME/tools
     export PATH=$PATH:$ANDROID_HOME/tools/bin
     export PATH=$PATH:$ANDROID_HOME/platform-tools
     ```

2. **"Could not connect to development server"**
   - Make sure Metro bundler is running
   - Check that your device/emulator and computer are on the same network
   - For physical device: Run `adb reverse tcp:8081 tcp:8081`

3. **Build errors**
   - Clean build: `cd android && ./gradlew clean && cd ..`
   - Clear cache: `npm start -- --reset-cache`

### iOS Issues

1. **"Pod install failed"**
   - Update CocoaPods: `sudo gem install cocoapods`
   - Clean pods: `cd ios && rm -rf Pods Podfile.lock && pod install && cd ..`

2. **Build errors**
   - Clean build folder in Xcode: Product → Clean Build Folder (Shift+Cmd+K)
   - Clear derived data

### General Issues

1. **Metro bundler cache issues**
   ```bash
   npm start -- --reset-cache
   ```

2. **Node modules issues**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Watchman issues (macOS/Linux)**
   ```bash
   watchman watch-del-all
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Loader.tsx      # Loading indicators (global, inline, coin-specific)
│   └── ErrorDisplay.tsx # Error message display component
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Dashboard.tsx   # Crypto dashboard page
│   └── Portfolio.tsx   # Portfolio management page
├── store/              # Redux store configuration
│   ├── store.ts        # Store setup with saga middleware
│   ├── slices/         # Redux Toolkit slices
│   │   ├── authSlice.ts      # Authentication state
│   │   ├── cryptoSlice.ts    # Cryptocurrency data state
│   │   └── portfolioSlice.ts # Portfolio state
│   └── sagas/          # Redux-Saga side effects
│       ├── rootSaga.ts      # Root saga combining all watchers
│       ├── authSaga.ts      # Authentication saga
│       ├── cryptoSaga.ts    # Crypto data fetching and polling saga
│       └── portfolioSaga.ts # Portfolio management saga
└── App.tsx             # Main app component with navigation
```

## License

This project is part of a coding task/assessment.

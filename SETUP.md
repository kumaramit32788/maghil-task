# Quick Start Guide

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 3. Start Metro Bundler

Open a terminal and run:

```bash
npm start
```

Keep this terminal open. Metro bundler needs to be running.

### 4. Run the App

#### For Android:

Open a **new terminal** and run:

```bash
npm run android
```

**Requirements:**
- Android Studio installed
- Android emulator running OR physical device connected
- USB debugging enabled (for physical devices)

#### For iOS (macOS only):

Open a **new terminal** and run:

```bash
npm run ios
```

**Requirements:**
- Xcode installed
- iOS Simulator available OR physical device connected

## Login Credentials

- **Username:** `admin`
- **Password:** `admin123`

## Common Commands

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Clear Metro cache
npm start -- --reset-cache

# Lint code
npm run lint

# Run tests
npm test
```

## Troubleshooting

### Metro Bundler Issues

If you see connection errors:

```bash
# Clear cache and restart
npm start -- --reset-cache
```

### Android Build Issues

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
```

### iOS Build Issues

```bash
# Clean iOS build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

Then clean in Xcode: **Product → Clean Build Folder** (Shift+Cmd+K)


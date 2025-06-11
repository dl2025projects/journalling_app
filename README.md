# Journal App

A React Native mobile app for personal journaling with cloud synchronization.

## Features

- Create and manage journal entries
- Cloud synchronization
- User authentication
- Offline draft support
- Search functionality

## Production Setup

This version of the Journal App is configured to work with the deployed backend server hosted on Render.com. There's no need to run a local server.

### Cleaning Up the Project

To remove unnecessary development files and optimize the project for production:

1. Run the cleanup script:
   ```
   node cleanup.js
   ```
   Or double-click on `cleanup.bat` (Windows)

This will:
- Remove test and development directories
- Clean up build artifacts
- Remove iOS files (since we're focusing on Android)
- Optimize package.json for production

### Building a Production APK

To build a production-ready APK:

1. Run the build script:
   ```
   node build-production.js
   ```
   Or double-click on `build-production.bat` (Windows)

This will:
- Run cleanup if it hasn't been done yet
- Configure the app for production
- Build a release APK
- Copy the APK to the project root as `JournalApp-release.apk`

### Direct Installation

After building, you can install the app directly on your Android device by:

1. Enabling "Install from Unknown Sources" in your device settings
2. Transferring the APK to your device
3. Opening the APK file on your device to install it

## Running for Development

If you need to make changes to the app:

1. Ensure you have React Native development environment set up
2. Run: `npx react-native run-android`

## Backend

The app is configured to use the backend deployed at:
```
https://journal-app-server.onrender.com/api
```

No local server setup is required.

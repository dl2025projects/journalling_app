# Journal Mobile Application

A mobile application built with React Native for personal journaling.

## Purpose

This application allows users to create and manage personal journal entries. Users can track their daily thoughts, experiences, and memories in a secure and user-friendly environment.

## Features

- Create, edit, and delete journal entries
- Search functionality to find entries by keywords
- Streak counter to track daily journaling consistency
- Auto-save functionality to prevent data loss

## Dependencies

- React Native
- React Navigation
- Async Storage for local data persistence
- Axios for API communication

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/dl2025projects/journalling_app.git
   ```

2. Install dependencies:
   ```
   cd JournalApp
   npm install
   ```

3. Run the application:
   ```
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

## Architecture

The application follows a component-based architecture using React Native:

- **Screens**: Contains all the main screens of the application
- **Components**: Reusable UI components
- **Services**: API and data handling services
- **Utils**: Utility functions and helpers
- **Hooks**: Custom React hooks
- **Context**: Application state management

## Quick Setup

For a streamlined setup experience, you can use the provided setup script:

```
node app_setup.js
```

This script will:
1. Install all dependencies for the mobile app
2. Setup the server (database, environment variables)
3. Configure the API endpoint with your local IP address
4. Optionally start both the server and the app

## Database Integration

The journal app now integrates with a MySQL database through a Node.js backend API. This allows for persistent storage of journal entries and user authentication.

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Run the setup script:
   ```
   node setup.js
   ```
   This will guide you through creating an environment file, installing dependencies, and setting up the database.

3. Start the server:
   ```
   npm run dev
   ```
   The server will run on http://localhost:3000 by default.

### Mobile App Configuration

1. Update the API endpoint in `src/services/api.js`:
   ```javascript
   // Change this to your actual server URL (your computer's IP address)
   const BASE_URL = 'http://192.168.x.x:3000/api';
   ```

2. Install AsyncStorage package if not already installed:
   ```
   npm install @react-native-async-storage/async-storage
   ```

3. Run the app:
   ```
   npx react-native run-android
   ```
   or
   ```
   npx react-native run-ios
   ```

### API Documentation

Once the server is running, you can access the API documentation at http://localhost:3000/api-docs

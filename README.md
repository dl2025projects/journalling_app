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

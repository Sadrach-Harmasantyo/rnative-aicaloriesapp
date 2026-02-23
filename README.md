# AI Calories App

## Overview
AI Calories App is a universal React Native application built with Expo that allows users to track their daily food intake and calories using Artificial Intelligence. With features like image recognition for food, seamless authentication, and data visualization, managing your diet has never been easier.

## Features
- **AI Food Recognition**: Upload or take photos of your meals and let Google's Gemini AI analyze the food to estimate calories and nutritional value.
- **Authentication**: Secure, seamless user authentication and session management powered by Clerk.
- **Cloud Database**: Stores user data, logged meals, and preferences securely using Firebase.
- **Local Storage**: Uses AsyncStorage for seamless local caching and offline capabilities.
- **Charts & Statistics**: Visualize your daily and weekly calorie intake using interactive metrics and charts.
- **Push Notifications**: Stay on track with daily scheduled reminders to log your meals.
- **Cross-Platform**: Built to run natively on Android, iOS, and Web using Expo.

## Tech Stack
- [Expo](https://expo.dev) & [React Native](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing
- [Clerk](https://clerk.com/) for Authentication
- [Google Gemini AI](https://ai.google.dev/) for intelligent food analysis and calorie estimation
- [Firebase](https://firebase.google.com/) for backend services and data storage
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) for smooth 60fps animations
- [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit) for data visualization

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed along with npm or yarn.

### 1. Install dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create a `.env` file in the root directory and configure the required API keys for Clerk, Gemini, and Firebase:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### 3. Start the app
```bash
npx expo start
```
In the output, you can choose to run the app on an Android emulator, an iOS simulator, or a physical device using the Expo Go app.

## Project Structure
- `app/` - Contains the main application screens and file-based routing logic.
- `components/` - Reusable UI components used across screens.
- `services/` - Integration with external services like Firebase and Notifications.
- `assets/` - Images, fonts, and other static assets.

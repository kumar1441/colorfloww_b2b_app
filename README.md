# NailArt Mobile App 💅✨

A premium AI-powered virtual nail color try-on application built with **Expo**, **React Native**, and **Skia**.

## 🚀 Overview

This app allows users to visualize nail polish colors in real-time using their mobile camera. It features a high-end UI/UX, multi-step onboarding, and gamified engagement features to drive daily usage.

## ✨ Features

- **Virtual Try-On**: Real-time nail color overlay using `@shopify/react-native-skia`.
- **Premium UI**: Modern aesthetics featuring glassmorphism, custom typography, and a "Safety First" stable design.
- **Smart Onboarding**: Multi-step flow collecting user profile data (Age, Gender, Location) with a privacy-first consent model.
- **Authentication**: Local session persistence using `expo-secure-store`.
- **Gamification**: 
  - **Streaks**: Tracks consecutive days of activity.
  - **Celebrations**: Milestone alerts (e.g., 5-day streak).
  - **Sharing**: Premium streak cards and community color sharing.
- **Daily Reminders**: Scheduled notifications to keep engagement high.

## 🛠 Tech Stack

- **Framework**: Expo SDK 54 / React Native 0.81
- **Icons**: Lucide React Native
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Animations**: React Native Reanimated (Stable v3.16.1)
- **Graphics**: Shopify React Native Skia
- **Persistence**: Expo SecureStore
- **Notifications**: Expo Notifications

## 📦 Project Structure

```text
├── app/                  # Expo Router directory
│   ├── (main)/           # Main application tabs
│   ├── index.tsx         # Welcome / Splash screen (Auto-login logic)
│   ├── login.tsx         # Premium Login screen
│   ├── onboarding.tsx    # Multi-step signup flow
│   └── _layout.tsx       # Root layout & Notifications init
├── components/           # Reusable UI components
│   ├── StreakCard.tsx    # Weekly progress UI
│   ├── StreakShareModal.tsx # Fullscreen share tray
│   └── NailOverlaySkia.tsx # Skia rendering logic
├── services/             # Logic & API services
│   ├── auth.ts           # SecureStore session management
│   ├── gamification.ts   # Streak & Milestone logic
│   └── notifications.ts  # Daily reminder scheduling
└── global.css            # Tailwind / NativeWind styles
```

## 🚦 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
   *Note: We use `--legacy-peer-deps` to handle version alignment between Skia and Reanimated.*

2. **Start the App**:
   ```bash
   npx expo start --clear
   ```

3. **Verify Features**:
   - Complete the **Onboarding** to see the 2-step setup.
   - Perform a **Try-On** to start your streak.
   - Check the **Profile** tab to share your progress.

## 🤝 Guidelines for Development

- **Safety First**: Prioritize stability over complex animations. Reanimated is enabled but should be used sparingly for core interactions.
- **Theming**: Always use the brand colors:
  - Sage Green: `#697D59`
  - Cream Base: `#F9F7F4`
- **Privacy**: All user data collection must be cleared through the `AuthService` and respect the Consent Modal.

---
*Created with ❤️ for Nail Enthusiasts.*

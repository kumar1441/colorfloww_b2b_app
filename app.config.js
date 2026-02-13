export default {
  expo: {
    name: "Colorfloww",
    slug: "colorfloww",
    version: "1.3.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.nailay.colorfloww",
      buildNumber: "4",
      infoPlist: {
        NSCameraUsageDescription: "Allow Colorfloww to access your camera to create nail art.",
        NSPhotoLibraryUsageDescription: "Allow Colorfloww to access your photos to select nail art references.",
        NSFaceIDUsageDescription: "Allow Colorfloww to use FaceID for secure login.",
        NSLocationWhenInUseUsageDescription: "Allow Colorfloww to access your location to improve local recommendations.",
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.nailay.colorfloww",
      versionCode: 3,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "c6923db5-d7b0-4ad9-bc07-43f606d791b6"
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      privacyPolicyUrl: "https://colorfloww.com/privacy"
    },
    scheme: "colorfloww",
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          "android": {
            "enableProguardInReleaseBuilds": true,
            "proguardRules": "./proguard-rules.pro"
          }
        }
      ]
    ]
  }
};
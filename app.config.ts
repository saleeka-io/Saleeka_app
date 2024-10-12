import { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
  name: "testapp",
  slug: "testapp",
  version: "4.0.4",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    infoPlist: {
      NSPhotoLibraryUsageDescription: "This app requires access to your photo library to allow you to upload profile pictures and other media."
    },
    supportsTablet: true,
    googleServicesFile: "./GoogleService-Info.plist",
    bundleIdentifier: "com.Saleeka.testapp"
  },
  android: {
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO"
    ],
    package: "com.Saleeka.testapp"
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    "expo-camera",
    "@react-native-firebase/app",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static"
        }
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    apiKey: process.env.API_KEY || 'b506d88f-6895-4d83-a047-6e838593d063:fx',
    eas: {
      projectId: "3b979bc2-cfc2-4442-9119-644c23882210"
    }
  }
};

export default config;

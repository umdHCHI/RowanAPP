import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file
config({ path: resolve(__dirname, '.env') });

export default {
  expo: {
    name: "TheArchive",
    slug: "thearchivethesisproject",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "thearchive",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.roesorcerer.thearchivethesisproject"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      API_BASE_URL: process.env.API_BASE_URL || "https://rowanapi.fly.dev/api/",
      API_LOCAL_URL: process.env.API_LOCAL_URL,
      router: {},
      eas: {
        projectId: "5ffee148-6440-4876-bb7d-7fed0cc5346b"
      }
    },
    owner: "roesorcerer"
  }
}; 
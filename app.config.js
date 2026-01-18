import 'dotenv/config'

const isEasBuild = process.env.EAS_BUILD === 'true'
const profile = process.env.EAS_BUILD_PROFILE || process.env.EXPO_PUBLIC_EAS_BUILD_PROFILE
const isDevBuild = profile === 'development'

export default {
  expo: {
    name: 'The Archive',
    slug: 'thearchive',
    version: '2.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    icon: './assets/splashscreen/icon.png',
    backgroundColor: '#000000',
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.thearchive.app',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#000000',
      },
      package: 'com.thearchive.app',
    },
    plugins: [
      'expo-router',
      'expo-video',
      'expo-asset',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#000000',
          image: './assets/splashscreen/icon.png',
          resizeMode: 'contain',
          imageWidth: 200,
        },
      ],
    ],
    scheme: 'thearchive',
    // Updates configuration
    // Note: Updates are automatically disabled in development builds (expo start)
    // They only work in production builds created with EAS Build
    updates: {
      enabled: isEasBuild,
      checkAutomatically: 'ON_ERROR_RECOVERY', // Only check for updates after errors, not on startup
      fallbackToCacheTimeout: 0,
    },
    extra: {
      router: {},
      eas: {
        projectId: '3b487e69-4650-42e9-90e1-126402429650',
      },
      // Expose environment variables to the app
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      apiToken: process.env.EXPO_PUBLIC_API_TOKEN,
    },
  },
}


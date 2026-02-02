require('dotenv/config')

const appVersion = '2.0.0'
const isEasBuild = process.env.EAS_BUILD === 'true'
const profile = process.env.EAS_BUILD_PROFILE || process.env.EXPO_PUBLIC_EAS_BUILD_PROFILE
const isDevBuild = profile === 'development'

const BUNDLE_ID = 'com.thearchive.app'

module.exports = {
  // Root-level ios helps EAS credential step find bundleIdentifier when updating config
  ios: { bundleIdentifier: BUNDLE_ID },
  expo: {
    name: 'The Archive',
    slug: 'thearchive',
    icon: './assets/splashscreen/Loading_Book.png',
    version: appVersion,
    splash: {
      image: './assets/splashscreen/Loading_Book.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: BUNDLE_ID,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#000000',
        foregroundImage: './assets/splashscreen/Loading_Book.png',
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
          image: './assets/splashscreen/Loading_Book.png',
          resizeMode: 'contain',
          imageWidth: 200,
        },
      ],
      [
        'expo-notifications',
        {
          assets: './assets/splashscreen/Loading_Book.png',
          color: '#000000',
          sounds: [],
        },
      ],
    ],
    scheme: 'thearchive',
    // Updates configuration
    // Note: Updates are automatically disabled in development builds (expo start)
    // They only work in production builds created with EAS Build
    updates: {
      url: 'https://u.expo.dev/3b487e69-4650-42e9-90e1-126402429650',
      enabled: isEasBuild,
      checkAutomatically: 'ON_LOAD', // Only check for updates after errors, not on startup
      fallbackToCacheTimeout: 0,
    },
    runtimeVersion: appVersion,
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


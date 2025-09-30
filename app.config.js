import { withAndroidManifest, withDangerousMod } from '@expo/config-plugins';
import fs from 'fs';
import path from 'path';

// This is the upgraded custom plugin function
const withCustomAndroidModifications = (config) => {
  // First, modify the AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application[0];
    application.$['android:usesCleartextTraffic'] = 'true';
    application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    return config;
  });

  // Second, copy the network_security_config.xml file
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const resPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');
      const xmlPath = path.join(resPath, 'xml');
      
      // Ensure the 'xml' directory exists
      if (!fs.existsSync(xmlPath)) {
        fs.mkdirSync(xmlPath, { recursive: true });
      }

      const sourcePath = path.join(projectRoot, 'resources', 'network_security_config.xml');
      const destPath = path.join(xmlPath, 'network_security_config.xml');

      // Copy the file
      fs.copyFileSync(sourcePath, destPath);
      
      return config;
    },
  ]);
};

// This is your updated expo configuration
export default ({ config }) => {
  // Apply the custom plugin
  config = withCustomAndroidModifications(config);

  // Return the final modified config with explicit iOS configuration
  return {
    ...config,
    name: "TheArchive",
    slug: "thearchivethesisproject",
    version: "1.0.0",
    sdkVersion: "54.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "thearchive",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    plugins: [
      "expo-router",
      "expo-font", // Added for The Archive's mystical typography system
      [
        "expo-splash-screen",
        {
          image: "./assets/images/archive.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#000000"
        }
      ],
      "expo-av",
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.roesorcerer.thearchivethesisproject",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.roesorcerer.thearchivethesisproject",
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#070707ff"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.RECORD_AUDIO",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_EXTERNAL_STORAGE"
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/icon.png"
    },
    experiments: {
      typedRoutes: true
    },
    extra: {
      API_BASE_URL: process.env.API_BASE_URL || "http://131.212.41.8/api/",
      TEST_USER_TOKEN: process.env.TEST_USER_TOKEN,
      router: {},
      eas: {
        projectId: "5ffee148-6440-4876-bb7d-7fed0cc5346b"
      }
    }
  };
};
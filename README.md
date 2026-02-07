# The Archive - Newest Spring Working Version taking the Expert Study Into Account

Here we make changes to the original application and implement the expert findings into this application. 

Please note that due to Expo changes and us moving to Production Builds this is migrating to a EAS Workflow. For Expo to EAS merge please see: https://docs.expo.dev/develop/development-builds/expo-go-to-dev-build/

Due to APK 55 upgrade AND EAS prod builds Expo Go will no longer be supported on this project. Follow the link for instructions on how to merge from Expo Go to EAS. The workflow from that point forward should follow EAS dev, instructions below. 

## Features

###  Core Gameplay - Mimics What we had before
- **Character Creation**: Create your unique avatar to journey through The Archive
- **Story Progression**: Stories now flow passage-to-passage (Story → Passage → Choice → Passage). The introduction teaches the player how the buttons work, then the main stories introduce the Library and the Fractures. A mini game can trigger during the second story in the employee lounge.
- **Choice-Based Narrative**: Make decisions that affect your lumens(expierence) and story progression. Lumens either provide unlocks or slowly light up the background. 



###  Story Game Features
- **Journal**: Reflect on your journey with guided prompts. Story will proc entries. 
- **Vantage**: A space-invaders style minigame for practicing thought reframing. Story will proc game and game can be practiced outside of story. 

## Getting Started
New Instructions updated 1/23
Use the workflow below to get a local build running and to publish updates with EAS.

### Prerequisites
- Node.js 18 LTS (project is verified on 18.18+)
- npm 9+ or Yarn 1.x (my references will use npm since that is what I use)
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Android Studio (API 34 emulator) and/or Xcode 15+ for simulators
- A physical device for final validation(see someone in HCI lab to borrow Andriod phone if needed); Expo Go is **not** supported because the app depends on custom dev clients

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables

Get the .env file from someone within the HCI lab team and add to the root of this project. 

Example: 

```cmd
thearchive\.env
```

For production builds this is hosted here: 

https://expo.dev/accounts/roesorcerer/projects/thearchive 

This project can be rebuilt on Expo to any other developer just ensure you set up the env information in the CLI or web UI so the builds do not fail. 

https://docs.expo.dev/guides/environment-variables/ 

### 3. Build or install a development client
Because Expo Go cannot load the custom modules in this repo, you must install a dev build once per platform:

```bash
# Android package (.apk)
eas build --profile development --platform android

# iOS simulator build (.tar.gz)
eas build --profile ios-simulator --platform ios
```

Download the resulting artifact from the EAS dashboard, install it on your device or simulator, and keep it up to date whenever native modules change.

### 4. Run the app locally
```bash
npx expo start --dev-client
```

- Press `a` to launch the Android dev client that you installed in the previous step.
- Press `i` to launch the iOS simulator build.
- Use the Metro CLI to reload (`r`) or open dev tools (`d`).

Available npm scripts:
- `npm run start` – alias for `expo start` (Metro only).
- `npm run android` – builds and deploys the native project to a connected Android device via `expo run:android --device`.
- `npm run ios` – rebuilds the iOS project with `expo run:ios`.

### 5. Create production artifacts
Run the following when you are ready for QA or release testing:

```bash
# Production-ready Android APK (configured via eas.json)
eas build --profile production --platform android

# Publish an OTA update to the prod channel
eas update --channel prod --platform android --message "Describe the change"
```

Submit the generated artifacts through the Google Play Console or distribute them internally with the EAS dashboard.

### 6. Common troubleshooting steps
- Clear every cache before debugging Metro issues: `expo start --dev-client --clear`.
- If a dev client fails to open, uninstall the old build and reinstall the latest artifact.
- Sync node modules after changing Expo SDK versions by removing `node_modules`, deleting `package-lock.json`, and rerunning `npm install`.

## Asset Organization

Assets are organized in the project root:
- `attributes/` - Attribute level images (connection, courage, exploration, fear) - Might need to remove or add deprecated tag 
- `equipment/` - Equipment items organized by type (weapons, armor, helmets, boots) - Might need to remove or add deprecated tag 
- `thecurator/` - The Curator NPC character images with different emotions - Might need to remove or add deprecated tag (on the backend now)
- `Vantage/` - Minigame assets (player, projectiles, power-ups, etc.)
- `hauntedlibrary.png` - Main background image for The Archive

All assets are referenced using `require()` statements for proper bundling with Expo.

## Project Structure

```
thearchive/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx          # Entry point
│   ├── character-creator.tsx
│   ├── story.tsx          # Main story progression
│   ├── journal.tsx        # Reflection journal
│   ├── vantage.tsx # Minigame
│   └── profile.tsx        # Character profile
├── components/            # Reusable components
│   ├── the-curator.tsx   # NPC component
│   ├── attributes-display.tsx
│   └── equipment-display.tsx
├── stores/               # Zustand state management
│   └── game-store.ts     # Game state and persistence
├── types/                # TypeScript definitions
│   └── story.ts          # Story structure types
├── attributes/           # Attribute level images
├── equipment/            # Equipment/item images
├── thecurator/           # Curator NPC images
├── Vantage/      # Minigame assets
└── hauntedlibrary.png    # Background image
```

## Technologies used

- **React Native** with **Expo** - Cross-platform mobile development
- **Expo Router** - File-based routing
- **TypeScript** - Type safety
- **Zustand** - State management with persistence
- **Zod** - Schema validation

- This is expanding slowly 

## Contributing

This is a college project inspired by Betwixt. Feel free to extend and improve!

## License

Educational use only.


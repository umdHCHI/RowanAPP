# The Archive - Newest Spring Working Version taking the Expert Study Into Account

Here we make changes to the original application and implement the expert findings into this application. 

Please note that due to Expo changes and us moving to Production Builds this is migrating to a EAS Workflow. For Expo to EAS merge please see: https://docs.expo.dev/develop/development-builds/expo-go-to-dev-build/

## Features

###  Core Gameplay - Mimics What we had before
- **Character Creation**: Create your unique avatar to journey through The Archive
- **Story Progression**: Experience a narrative that starts in "the void" and gradually reveals The Archive library
- **Choice-Based Narrative**: Make decisions that affect your attributes and story progression
- **Attribute System**: Build four core attributes through your choices: - Not sure how to implement
  - **Connection**: Your ability to connect with others and seek support
  - **Courage**: Your bravery in facing challenges
  - **Exploration**: Your curiosity and willingness to explore new solutions
  - **Fear**: Your awareness and understanding of fear

###  Game Mechanics
- **The Curator**: Guided by a mysterious hooded cat NPC with various emotional states

###  Story Game Features
- **Journal**: Reflect on your journey with guided prompts
- **Vantage**: A space-invaders style minigame for practicing thought reframing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator, or Expo Go app on your phone

### Installation

1. Install dependencies:
```bash
npm install
```

2. (First time setup) Clear cache and reinstall:
```bash
npm start -- --clear
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Asset Organization

Assets are organized in the project root:
- `attributes/` - Attribute level images (connection, courage, exploration, fear)
- `equipment/` - Equipment items organized by type (weapons, armor, helmets, boots)
- `thecurator/` - The Curator NPC character images with different emotions
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


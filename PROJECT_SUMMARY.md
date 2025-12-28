# The Archive - Project Summary

## Overview
A React Native stress management application for college students, inspired by Betwixt. The app uses gamification and narrative storytelling to help students understand and manage stress through an engaging journey in "The Archive" - a mystical library that represents their emotional landscape.

## Core Features Implemented

### 1. Character Creation
- **Location**: `app/character-creator.tsx`
- Users create their character with a name and avatar selection
- Four avatar options representing different archetypes
- Character data persisted using Zustand with AsyncStorage

### 2. Story System
- **Location**: `app/story.tsx`, `types/story.ts`
- Five-chapter narrative progression:
  1. **The Void** - Starting point representing feeling lost
  2. **A Faint Light** - First encounter with The Curator
  3. **The Archive Reveals Itself** - Library begins to form
  4. **Understanding Begins** - Deeper insights
  5. **The Full Archive** - Complete clarity
- Visual progression system: Void overlay gradually fades as clarity increases (0-100%)
- Choice-based narrative affecting character attributes
- Equipment rewards during story progression

### 3. Attribute System
- **Location**: `stores/game-store.ts`, `components/attributes-display.tsx`
- Four core attributes (1-5 scale):
  - **Connection**: Ability to connect and seek support
  - **Courage**: Bravery in facing challenges
  - **Exploration**: Curiosity and willingness to explore
  - **Fear**: Understanding and awareness of fear
- Attributes change based on story choices
- Visual representation with level bars and attribute images

### 4. The Curator (NPC)
- **Location**: `components/the-curator.tsx`
- Hooded cat guide with multiple emotional states:
  - default, excited, talking, tired, winking, stretch, pawup
- Dynamic emotion changes based on story context
- Image assets in `thecurator/` folder

### 5. Equipment System
- **Location**: `stores/game-store.ts`, `components/equipment-display.tsx`
- Equipment types: weapons, armor, helmets, boots
- Equipment unlocked through story progression
- Displayed in profile screen with visual icons

### 6. Journal Feature
- **Location**: `app/journal.tsx`
- Reflection prompts to help users process their experience
- Shows current attribute levels
- Saves entries (currently local - can be extended to backend)

### 7. Thought Defender Minigame
- **Location**: `app/thought-defender.tsx`
- Space invaders-style game for thought reframing practice
- Mechanics:
  - Shoot positive projectiles at negative thoughts
  - Power-ups (slow time, multishot, extra life, etc.)
  - Score-based attribute rewards
- Assets in `thoughtDefender/` folder

### 8. Profile Screen
- **Location**: `app/profile.tsx`
- Shows character information
- Displays attributes with images
- Equipment collection view
- Navigation to all major features
- Option to reset game progress

## Technical Architecture

### State Management
- **Zustand** with persistence via AsyncStorage
- Centralized game state in `stores/game-store.ts`
- Character, attributes, equipment, and story progression all managed in one store

### Navigation
- **Expo Router** for file-based routing
- Stack navigation setup in `app/_layout.tsx`
- Screens:
  - `/` - Entry point with conditional routing
  - `/character-creator` - Character creation
  - `/story` - Main story experience
  - `/journal` - Reflection journaling
  - `/thought-defender` - Minigame
  - `/profile` - Character profile and navigation hub

### Assets
All assets are organized in the project root:
- `attributes/` - Attribute level images (connection, courage, exploration, fear)
- `equipment/` - Equipment items by type
- `thecurator/` - Curator NPC character images
- `thoughtDefender/` - Minigame sprites
- `hauntedlibrary.png` - Background image

### Styling
- Custom StyleSheet-based styling throughout
- Dark theme with purple accent colors (#6B46C1)
- Responsive design considerations
- Safe area handling for device notches

## MDA Framework Implementation

### Mechanics
- ✅ Choice-based story progression
- ✅ Attribute system responding to choices
- ✅ Equipment unlocking
- ✅ Score-based minigame
- ✅ Progress persistence

### Dynamics
- ✅ Player agency through meaningful choices
- ✅ Progressive world revelation (void → library)
- ✅ Risk/reward in decision making
- ✅ Skill development through practice
- ✅ Emotional progression visualization

### Aesthetics
- ✅ **Fantasy**: Mystical library setting
- ✅ **Discovery**: Unveiling The Archive
- ✅ **Expression**: Character customization
- ✅ **Challenge**: Attribute management and minigame
- ✅ **Narrative**: Engaging story with The Curator

## Next Steps / Enhancements

### Potential Improvements
1. **Backend Integration**: Connect journal entries and progress to a backend
2. **More Story Chapters**: Expand the narrative with additional chapters
3. **Social Features**: Share progress with friends
4. **Analytics**: Track stress management outcomes
5. **Notifications**: Reminders for journaling or playing
6. **More Minigame Features**: Additional power-ups, levels, difficulty settings
7. **Avatar Customization**: More detailed character creation
8. **Sound/Music**: Audio feedback and ambient sounds
9. **Animations**: Enhanced transitions and micro-interactions
10. **Accessibility**: Screen reader support, larger text options

### Known Considerations
- Image requires use static require() statements (cannot use dynamic paths)
- Asset paths are relative to component locations
- AsyncStorage has size limits (consider backend for extensive data)
- Minigame performance may need optimization for lower-end devices

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

## File Structure Reference

```
thearchive/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root navigation
│   ├── index.tsx          # Entry point
│   ├── character-creator.tsx
│   ├── story.tsx          # Main story
│   ├── journal.tsx
│   ├── thought-defender.tsx
│   └── profile.tsx
├── components/            # Reusable components
│   ├── the-curator.tsx
│   ├── attributes-display.tsx
│   └── equipment-display.tsx
├── stores/               # State management
│   └── game-store.ts
├── types/                # TypeScript types
│   └── story.ts
└── [assets]/            # Image assets
```

## Conclusion

The Archive successfully implements a gamified stress management experience that:
- Engages students through narrative and gameplay
- Validates emotions and provides coping strategies
- Uses MDA framework principles for engaging design
- Provides both reflective (journal) and active (minigame) stress management tools
- Creates a safe, whimsical space to explore stress and resilience

The application is ready for testing and can be extended based on user feedback and research findings.


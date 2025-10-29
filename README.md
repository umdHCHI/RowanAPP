
# The Archive - Gamified Mental Wellness Application
# This is the final Prod version for Usability Testing. 

A React Native/Expo application for **stress management research in college students** using narrative-based therapeutic interventions. Set in a mystical library overseen by "The Curator," this app delivers evidence-based mental health content through immersive RPG-style storytelling.

[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-61DAFB.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.20-000020.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Academic-blue.svg)]()

## 📖 Project Overview

**The Archive** is a **master's thesis research application** investigating the efficacy of narrative tools in digital therapeutic interventions for college student stress management. The app implements a **dual-path research design** to compare different user experience paradigms while delivering identical therapeutic content.

### 🔬 Research Study Design

- **Character Path (Research Group A)**: Full RPG experience with character creation, equipment systems, and traditional game progression mechanics
- **Personality Path (Research Group B)**: Streamlined story experience tailored to Big Five personality traits with coping tool acquisition
- **Controlled Variables**: Both paths receive identical therapeutic content, story choices, and wellness interventions
- **Primary Outcome**: Stress management skill acquisition and application in real-world scenarios

### 🎨 Visual Design Philosophy

**Mystical Library Aesthetic** - Ancient wisdom meets digital innovation:
- **Color Palette**: Deep browns, burgundy, parchment whites with cyan/gold accents (`#4ee6e6`, `#d4af37`)
- **Typography**: Serif fonts for mystique, sans-serif for readability
- **UI Elements**: Engraved text effects, glowing accents, card-based layouts with gradients
- **Atmosphere**: Think ancient tomes with holographic overlays

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thearchive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file (see Environment Configuration section)
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   ```bash
   # Mobile testing with Expo Go
   # Scan QR code with Expo Go app
   
   # Android
   npx expo run:android
   
   # iOS (macOS only)
   npx expo run:ios
   
   # Web
   npx expo start --web
   ```

---

## 🏗️ Architecture Overview

### Dual Research Path System

The application implements sophisticated routing to support the research study design:

```typescript
// Research group assignment determines entire UX flow
if (researchCondition === 'character') {
  return <CharacterHomeScreen />; // Full RPG mechanics
} else {
  return <PersonalityHomeScreen />; // Streamlined personality-based experience
}
```

### State Management Architecture

**MasterStateContext** - Single source of truth preventing circular dependencies:
```typescript
const { theme, auth, character, equipment, wellness, ui } = useMasterState();
```

Key contexts:
- `AuthContext`: User authentication and profile management
- `MasterStateContext`: Unified state management (replaces individual contexts)
- `PersonalityContext`: Big Five personality configurations and coping strategies
- `ThemeContext`: Dynamic theming based on user research path

### Backend Integration

**Centralized API Service** with Django REST Framework:
```typescript
// apiService.ts - Centralized HTTP client
const response = await apiService.get('stories');
const characterData = await apiService.post('characters', characterConfig);
```

**Key API Patterns**:
- **Token-based authentication** with AsyncStorage persistence
- **Dual endpoint support** for character vs personality research conditions
- **Extensive error handling** and offline fallbacks
- **CORS configuration** for web development

---

## 📁 Project Structure

```
thearchive/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                   # Authentication flow
│   ├── (character)/              # Character research path
│   ├── (personality)/            # Personality research path
│   ├── (onboarding)/             # Research group assignment
│   ├── _layout.tsx               # Root layout with providers
│   └── index.tsx                 # Entry point and route resolution
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── CharacterCreator/     # Avatar customization system
│   │   ├── personality/          # Personality-specific components
│   │   ├── survey/               # Big Five personality assessment
│   │   ├── CodexModal.tsx        # Journaling system
│   │   ├── ThoughtDefenderModal.tsx # Mini-game component
│   │   └── ...
│   ├── screens/                  # Screen components
│   │   ├── auth/                 # Login/registration
│   │   ├── characterStory/       # Character path screens
│   │   ├── personalityStory/     # Personality path screens
│   │   └── onboarding/           # Research assignment
│   ├── context/                  # State management
│   │   ├── MasterStateContext.tsx # Unified state management
│   │   ├── AuthContext.tsx       # Authentication state
│   │   ├── PersonalityContext.tsx # Big Five configurations
│   │   └── ThemeContext.tsx      # Dynamic theming
│   ├── services/                 # API and external services
│   │   ├── apiService.ts         # Main HTTP client
│   │   ├── apiConfig.ts          # Endpoint configurations
│   │   └── index.ts              # Service exports
│   ├── utils/                    # Utility functions
│   │   ├── rewardsUtils.ts       # Game progression logic
│   │   ├── storyRewardIntegration.ts # Story completion rewards
│   │   └── personalityRewards.ts # Personality-based bonuses
│   ├── types/                    # TypeScript type definitions
│   │   ├── personality.ts        # Big Five related types
│   │   ├── user.ts               # User and character types
│   │   └── thoughtDefender.ts    # Mini-game types
│   ├── assets/                   # Static assets
│   │   ├── equipment/            # Equipment and gear icons
│   │   ├── character-creator/    # Avatar customization assets
│   │   └── UI/                   # Interface elements
│   ├── hooks/                    # Custom React hooks
│   │   ├── usePersonalityHomeData.tsx # Personality path data
│   │   ├── useCharacterCreation.tsx   # Character customization
│   │   └── useStoryEngine.ts     # Story progression logic
│   ├── constants/                # Application constants
│   │   ├── personality.ts        # Big Five configurations
│   │   └── characterCreator.ts   # Avatar options
│   ├── data/                     # Static data and configurations
│   │   ├── wellnessSystem.ts     # Wellness mechanics
│   │   └── surveyQuestions.ts    # Personality assessment
│   └── styles/                   # Styling and themes
│       ├── globalStyles.ts       # Global style definitions
│       └── theme.ts              # Theme configurations
├── assets/                       # Expo assets
│   ├── images/                   # App icons and images
│   ├── equipment/                # Game equipment assets
│   └── fonts/                    # Custom fonts
├── android/                      # Android-specific configuration
├── resources/                    # Build resources
├── app.config.js                 # Expo configuration
├── eas.json                      # Expo Application Services config
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

---

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root:

```bash
# Backend API Configuration
API_BASE_URL=SAMPLE    # Production backend
# API_BASE_URL=http://localhost:8000/api/ # Local development
# Contact admin for env info 
# Development Testing (Optional)
TEST_USER_TOKEN=your_test_token_here

# Expo Build Configuration (for deployment)
EXPO_TOKEN=your_expo_token_here
```

### Backend Configuration

The app connects to a Django REST Framework backend. Key configuration:

```typescript
// src/services/apiConfig.ts
export const apiBaseUrl = process.env.API_BASE_URL || "BACKEND URL";
```

**API Endpoints Structure**:
- `auth/login/` - User authentication
- `users/` - User profile management
- `story/catalog/` - Story content delivery
- `character-gear/` - Equipment system (Character path)
- `coping-tools/` - Wellness tools (Personality path)
- `journal/codex-entries/` - Journaling system
- `personality/traits/` - Big Five personality data

---

## 🎮 Core Features

### Interactive Storytelling System

**Choose-your-own-adventure narratives** focused on stress management:

```typescript
// Story structure with personality-based filtering
story: {
  id: 25,
  title: "The Whispering Stacks - Agreeableness",
  personality_focus: ["agreeableness"], // Filters by user's primary trait
  chapter_count: 3,
  wellness_focus: ["boundary_setting", "assertiveness"]
}
```

**Key Story Features**:
- **Branching narratives** with meaningful choices affecting outcomes
- **Personality-based filtering** for Personality path users
- **Therapeutic content integration** in every story decision
- **Progress tracking** with completion rewards
- **Replay system** for exploring different story paths

### Character Creation & Customization

**Comprehensive avatar system** for Character path users:

- **Visual Customization**: Hair, eyes, clothing, backgrounds with color variations
- **Personality Integration**: Character traits affect story options and equipment bonuses
- **Equipment System**: 50+ items providing wellness stat bonuses
- **Progressive Unlocks**: New customization options through story completion

### Dual Equipment/Coping Tool System

**Character Path** - Traditional RPG equipment:
```typescript
const equipment = {
  'Ancient Scroll': { type: 'focus', bonus: { awareness: +2 } },
  'Iron Sword': { type: 'combat', bonus: { resilience: +3 } },
  'Healing Potion': { type: 'restoration', bonus: { balance: +2 } }
};
```

**Personality Path** - Evidence-based coping strategies:
```typescript
const copingTools = {
  'Grounding Techniques': { category: 'anxiety', description: '5-4-3-2-1 sensory grounding' },
  'Boundary Setting': { category: 'relationships', description: 'Healthy limit establishment' },
  'Mindful Breathing': { category: 'stress', description: 'Regulated breathing exercises' }
};
```

### Journal & Codex System

**Reflective writing platform** with multimedia support:

- **Text Journaling**: Guided prompts based on story completion
- **Voice Recording**: Audio journal entries with mobile support (`expo-av`)
- **Drawing Canvas**: Artistic expression with touch optimization
- **File Upload**: Automatic backend synchronization with local fallbacks
- **Skill-based Rewards**: Wellness stat bonuses for journal completion

### ThoughtDefender Mini-Game

**Arcade-style stress management game** with comprehensive reward system:

```typescript
// Reward calculation based on performance metrics
const rewards = {
  experience: calculateExperienceGain(score, level, difficulty),
  wellnessStats: {
    awareness: Math.floor(accuracy * 0.1),
    resilience: Math.floor(survivalTime * 0.05),
    connection: positiveThoughtsCleared,
    balance: Math.floor(consistentPerformance * 0.08)
  }
};
```

**Game Features**:
- **Difficulty scaling** (Beginner to Master levels)
- **Performance tracking** (accuracy, survival time, thoughts processed)
- **Dynamic rewards** based on personality type and research condition
- **Integration with character progression** and wellness statistics

---

## 🧠 Research Implementation

### Big Five Personality Integration

The app implements evidence-based personality psychology:

```typescript
const PersonalityConfigs = {
  Openness: {
    gameTitle: "Chronicles of the Infinite Mind",
    scholarClass: "Sage Explorer",
    preferredTools: ["Creative Visualization", "Artistic Expression"],
    storyCategories: ["Mystery", "Discovery", "Innovation"]
  },
  Conscientiousness: {
    gameTitle: "The Methodical Codex",
    scholarClass: "Order Keeper",
    preferredTools: ["Goal Setting", "Time Management"],
    storyCategories: ["Challenge", "Growth", "Achievement"]
  }
  // ... additional personality configurations
};
```

### Research Data Collection

**Comprehensive analytics** for thesis research:

- **Story completion tracking** with choice analysis
- **Wellness skill application** in real-world scenarios
- **Engagement metrics** (session duration, feature usage)
- **Therapeutic outcome measurement** through validated assessments
- **A/B testing results** comparing Character vs Personality paths

### Ethical Research Practices

- **Informed consent** process during onboarding
- **Data anonymization** with secure user ID generation
- **Withdrawal options** allowing participants to leave the study
- **Academic transparency** about research goals and data usage

---

## 🧪 Development & Testing

### Debug Utilities

The app includes extensive debugging tools for development:

```typescript
// Built-in API testing
await apiService.debugStoryLoading();
await apiService.testBasicStoryLoading();
await apiService.debugCharacterHomeData();

// Equipment/coping tool testing
await debugEquipmentEndpoints(apiService);
await testGearRewardSystem();
```

### Development Scripts

```bash
# Development
npm start/npx expo start                    # Start Expo development server
npm run android             # Run on Android device/emulator
npm run ios                 # Run on iOS device/simulator (macOS only)
npm run web                 # Run in web browser

# Code Quality
npm run lint                # Run ESLint
npm run type-check          # TypeScript type checking

# Building & Deployment
eas build --platform android --profile production
eas build --platform ios --profile production
```

### Testing Strategy
### Testing being merged to JUnit testing
**Manual Testing Approaches**:
- **Cross-platform testing** on iOS, Android, and web
- **Research path validation** ensuring both Character and Personality paths work correctly
- **API integration testing** with backend synchronization
- **Offline functionality** testing with network disconnection
- **Performance testing** on various device specifications

**Key Testing Areas**:
- **Authentication flow** and user onboarding
- **Story progression** and choice mechanics
- **Equipment/coping tool acquisition** and validation
- **Journal system** with multimedia uploads
- **Mini-game performance** and reward calculation

### Common Issues & Solutions

**Equipment Reward Issues**:
```typescript
// Most common issue: research condition mismatch
if (researchCondition === 'character') {
  await apiService.getAvailableGearTypes(); // Character path
} else {
  await apiService.getAvailableCopingTools(); // Personality path
}
```

**API Service Debugging**:
- All API calls include extensive console logging
- Token authentication issues: Use `testTokenStorage()` and `validateToken()`
- CORS fallbacks implemented for web development
- Handle both array and object responses from backend

---

## 🚀 Deployment

### Build Configuration

**Expo Application Services (EAS) Build**:

```json
// eas.json
{
  "build": {
    "production": {
      "releaseChannel": "prod",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

### Production Deployment

```bash
# Build production APK
eas build --platform android --profile production

# Build iOS app (requires Apple Developer account)
eas build --platform ios --profile production

# Web deployment
npx expo export:web
# Deploy to your web hosting service
```
## Contact Admin for latest prod build
### Environment-specific Configuration

SEE PRODUCT OWNER 

```

---

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow TypeScript best practices and ESLint configuration
2. **Component Architecture**: Use functional components with hooks
3. **State Management**: Always use `useMasterState()` hook for global state
4. **API Integration**: Use `apiService` methods with proper error handling
5. **Cross-Platform**: Ensure mobile-first design with web fallbacks

### Commit Standards

```bash
feat: add personality-based story filtering
fix: resolve equipment reward validation
docs: update API endpoint documentation
test: add character creation flow tests
refactor: consolidate state management contexts
```

### Research Ethics

- **Data Privacy**: Never commit real user data or authentication tokens
- **Academic Integrity**: Properly cite any external research or therapeutic content
- **Transparency**: Document any changes that might affect research outcomes

---

## 📚 Academic References

This application implements evidence-based approaches from:

- **Cognitive Behavioral Therapy (CBT)** principles in story choices
- **Big Five Personality Model** (Costa & McCrae) for user personalization
- **Gamification in Digital Health** research for engagement mechanics
- **Narrative Therapy** techniques in interactive storytelling
- **Stress and Coping Theory** (Lazarus & Folkman) for wellness interventions

---

## 🔒 License & Research Usage

This application is developed for **academic research purposes** as part of a master's thesis on digital therapeutic interventions. 

**Research Data**: All user interactions are collected anonymously for academic analysis. Participants provide informed consent during onboarding.

**Commercial Use**: Not licensed for commercial distribution. Academic and research use only.

---

## 📞 Support & Contact

For technical issues or research inquiries:

- **Technical Documentation**: See `/docs` folder for detailed API references
- **Research Questions**: Contact thesis advisor or IRB committee
- **Bug Reports**: Create detailed issue reports with device/platform information

---

**Built with ❤️ for college student mental health research**

## Features

### Core Features
- **Interactive Stories**: Choose-your-own-adventure style narratives focused on mental health
- **Character Creation**: Customizable avatar system with personality-based story paths
- **Journal System**: Reflective writing prompts with skill-based rewards
- **Equipment System**: Backend-integrated gear that provides wellness stat bonuses
- **Mind Defender Mini-Game**: Arcade-style thought management game with comprehensive reward system

### ThoughtDefender Mini-Game Reward System

The ThoughtDefender mini-game now features a comprehensive reward system that integrates with the player's progression:

#### Reward Components
- **Experience Points**: Based on score, level, difficulty, accuracy, and survival time
- **Wellness Stats**: 
  - **Awareness**: Based on accuracy and quick thinking
  - **Resilience**: Based on survival time and difficulty
  - **Connection**: Based on positive thoughts cleared
  - **Balance**: Based on consistent performance
- **Foundation Attributes**: 
  - **Sight Beyond Sight**: High accuracy rewards
  - **Unbreakable Will**: Difficulty and survival-based
  - **Heart's Compass**: Positive thought management
  - **Elemental Harmony**: Balanced performance

#### Performance Metrics Tracked
- Total thoughts spawned
- Positive thoughts cleared (by tapping)
- Negative thoughts cleared (by projectiles or reaching bottom)
- Survival time
- Accuracy percentage
- Score and level progression

#### Difficulty Scaling
- **Beginner**: 1.0x multiplier
- **Intermediate**: 1.5x multiplier  
- **Advanced**: 2.0x multiplier
- **Expert**: 2.5x multiplier
- **Master**: 3.0x multiplier

#### Reward Calculation Formula
```
Base Experience = 100
Score Bonus = (score / 100) * 10
Level Bonus = level * 25
Win Bonus = won ? 200 : 50
Accuracy Bonus = (accuracy / 10) * 5
Time Bonus = (survivalTime / 30) * 15

Total Experience = (Base + Score + Level + Win + Accuracy + Time) * Difficulty Multiplier
```

#### Integration Points
- **Character Progression**: Rewards directly update character experience and wellness stats
- **Foundation System**: Contributes to the four core foundation attributes
- **Backend Sync**: All rewards are saved to the backend via API calls
- **UI Feedback**: Detailed reward messages show all gains and level-ups

## Technical Architecture

### Reward System Files
- `src/utils/rewardsUtils.ts`: Core reward calculation and processing functions
- `src/components/ThoughtDefenderModal.tsx`: Mini-game with integrated reward tracking
- `src/context/MasterStateContext.tsx`: Character state management and reward application

### Key Functions
- `processThoughtDefenderCompletion()`: Main reward processing function
- `calculateThoughtDefenderRewards()`: Reward calculation logic
- `formatThoughtDefenderRewardMessage()`: User-friendly reward display
- `createThoughtDefenderNotifications()`: Reward notification system

## Development

### Testing the Reward System
1. Open the ThoughtDefender mini-game
2. Click the "🧪 TEST REWARD SYSTEM" button to see sample rewards
3. Play the game normally to earn real rewards
4. Check the detailed reward messages after game completion

### Adding New Reward Types
1. Extend the `ThoughtDefenderReward` interface in `rewardsUtils.ts`
2. Update the calculation logic in `calculateThoughtDefenderRewards()`
3. Add display logic in `formatThoughtDefenderRewardMessage()`
4. Integrate with character context methods if needed

## Backend Integration

The reward system integrates with the backend through:
- `character.gainExperience()`: Updates character experience and level
- `character.gainWellness()`: Updates wellness stats (awareness, resilience, connection, balance)
- `apiService.updateGameData()`: Saves game performance data

All rewards are calculated client-side for immediate feedback, then synchronized with the backend for persistence.


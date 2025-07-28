
# Frontend Setup - Gamified Wellness App: *The Archive*

Welcome to the frontend codebase for **The Archive**, a narrative-based stress management app for college students built with **React Native** and **Expo**.

---

##  Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/frontend.git
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npx expo start
   ```

4. Install Expo Go on your mobile device to test.

---

##  Mobile Features

### Voice Recording
- **Mobile Support**: Voice recording is now fully supported on mobile devices using `expo-av`
- **Permissions**: The app will request microphone permissions when needed
- **File Upload**: Audio files are uploaded to the backend when saving to the Codex
- **Fallback**: If upload fails, recordings are saved locally

### Drawing Canvas
- **Mobile Support**: Drawing functionality works on both web and mobile
- **Touch Input**: Optimized for touch input using PanResponder
- **File Upload**: Drawing data is uploaded as JSON to the backend
- **Fallback**: If upload fails, drawings are saved locally as JSON

### Codex Modal
- **Cross-Platform**: Works on web, iOS, and Android
- **File Handling**: Automatically handles file uploads for mobile devices
- **Backend Integration**: Saves entries to the backend with proper file references

---

##  Folder Structure

```
/frontend
├── assets/
├── components/
├── screens/
├── navigation/
├── utils/
├── App.tsx
```

---

##  Week 1–3 Tasks (Motiffdesign Screens)

- [ ] **Home Screen** – introduction + avatar overview  
  🔗 Tutorial: [Create a Splash and Home Screen in Expo](https://www.freecodecamp.org/news/how-to-build-a-react-native-app-and-integrate-it-with-firebase/)

- [ ] **Character Select Screen** – choose narrative archetype  
  🔗 Tutorial: [React Native Character Select Grid](https://blog.logrocket.com/build-character-selection-screen-react-native/)

- [ ] **Story Scene** – narrative text + choices from JSON  
  🔗 Tutorial: [Render Branching Dialog Trees](https://www.youtube.com/watch?v=Ua9a1zXVe4I)

- [ ] **Reflection Prompt Screen** – user journals or selects emotion  
  🔗 Tutorial: [React Native Forms and Mood Trackers](https://www.youtube.com/watch?v=zvYgPlY_6f8)

- [ ] Use mock JSON data for choices before API integration

- [ ] Style components with Flexbox and Tailwind or styled-components  
  🔗 Tutorial: [Tailwind in React Native](https://dev.to/vonheikemen/using-tailwindcss-in-react-native-2023-3p4o)

- [ ] Implement navigation with React Navigation (tab + stack)  
  🔗 Tutorial: [React Navigation Setup](https://reactnavigation.org/docs/hello-react-navigation)

---

##  Testing and Debugging

- Use **Expo Go** for mobile testing
- Use **React Native Debugger** or browser tools
- Enable fast refresh + hot reload in development

---

##  Tips

- Use component-based design (e.g., `CharacterCard`, `StoryPanel`)
- Keep props simple and focused (data comes from context or JSON)
- Design for flexibility: not all users will follow the same path
- Write components to be tested with both static and dynamic props

---

# The Archive - Frontend

A React Native application for mental wellness through interactive storytelling and mindfulness exercises.

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


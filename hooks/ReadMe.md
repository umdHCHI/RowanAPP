What is this hooks folder for?

Great question! These are custom React hooks used throughout The Archive application. They encapsulate reusable logic, state management, and side effects to keep components clean and maintainable. The outline of this folder structure is as follows:


Mini-Game Hooks

- use-thought-defender-game.ts = Main game logic for the Vantage/Thought Defender mini-game. Handles all game state, collision detection, enemy spawning, boss mechanics, power-ups, fragments, and the game loop. This is a large hook (~1800 lines) that manages the entire game experience with Affective-DDA integration.

- use-game-director.ts = Dynamic Difficulty Adjustment (DDA) system for the mini-game. Calculates pressure scores, emotional intensity, and adjusts game difficulty in real-time based on player performance. Provides metrics like formation speed, move speed, and power-up spawn rates to the game hook.


Story Hooks

- use-story-engine.ts = Core story engine that manages story flow, passage loading, and choice making. Handles API calls with retry logic, error handling, and state management for the interactive story experience.

- use-story-engine-helpers.ts = Helper functions for the story engine. Includes retry logic with exponential backoff, passage normalization, starting passage resolution, and chapter finding utilities. These are pure functions that support the story engine.

- use-story-auto-advance.ts = Handles auto-advancing "Continue" choices in stories. Calculates delay based on text speed settings and content length, automatically advancing when appropriate.

- use-story-history.ts = Tracks story history (passages and choices) as the user progresses. Maintains a history array that can be used for navigation or display purposes. Filters out "Continue" choices from history.

- use-story-cards.ts = Transforms story data into card format for the hub. Includes daily unlock system based on user creation date. Uses story mapper utility to format stories for display.


Hub/Profile Hooks

- use-hub-profile.ts = Loads user profile from API and maps it to lumens in the game store. Syncs backend profile data with local game state on mount.

- use-hub-stories.ts = Fetches all stories for the hub using React Query. Provides caching and stale time management for story data.

- use-resources.ts = Aggregates data for the resources page. Combines stories, journal entries, powers, and memories into a unified resource format. Handles story progress mapping, memory transformation, and power display logic.


System Hooks

- use-notifications.ts = Manages push notifications for the app. Handles permission requests, notification scheduling, backend sync, and user preference management. Includes Expo Go detection and notification listener setup.


Fine for first pass through

Refactor plan

[] Split use-thought-defender-game.ts into smaller hooks (game state, collision detection, boss logic, fragments, etc.)
[] Extract constants from use-thought-defender-game.ts into vantage-constants.ts
[] Consolidate retry logic - use-story-engine-helpers.ts and use-story-engine.ts both have retry functions
[] Move pure helper functions from use-story-engine-helpers.ts to utils/story-helpers.ts
[] Add proper TypeScript interfaces for all hook return types
[] Consider splitting use-resources.ts - it's doing a lot of data transformation
[] Extract notification configuration constants from use-notifications.ts
[] Add index.ts to organize hook exports into one file
[] Consider creating a hooks/ directory structure (e.g., hooks/game/, hooks/story/, hooks/hub/)
[] Add JSDoc comments to all exported hooks for better IDE support

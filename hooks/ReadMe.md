# Hooks Directory

Custom React hooks used throughout The Archive application. They encapsulate reusable logic, data fetching, side effects, and component-scoped state management to keep components clean and maintainable.

## Organization Principles

**Hooks vs Stores:**
- **Hooks** (`hooks/`) = Component logic, data fetching, side effects, orchestration, and component-scoped state
- **Stores** (`stores/`) = Global/shared state that needs to be accessed across multiple components or persisted

**When to use Hooks:**
- Data fetching and API calls (with React Query)
- Side effects (useEffect, subscriptions)
- Orchestrating multiple stores or services
- Component-scoped state (e.g., game instance state)
- Transforming/combining data from multiple sources

**When to use Stores:**
- Global application state (auth, user preferences)
- Persisted state (AsyncStorage)
- State shared across many components
- State that needs to survive component unmounts


## Directory Structure

```
hooks/
├── index.ts              # Barrel: exports game, story, hub, use-notifications
├── use-notifications.ts  # System (root)
├── game/
│   ├── index.ts
│   ├── use-game-director.ts
│   ├── use-thought-defender-game.ts
│   └── vantage/          # Mini-game submodules
│       ├── index.ts
│       ├── ReadMe.md
│       ├── vantage-store.ts
│       ├── vantage-director.ts
│       ├── use-vantage-fragments.ts
│       ├── use-vantage-collisions.ts
│       ├── use-vantage-formation.ts
│       ├── use-vantage-boss.ts
│       ├── use-vantage-projectiles.ts
│       └── use-vantage-loops.ts
├── story/
│   ├── index.ts
│   ├── use-story-engine.ts
│   ├── use-story-auto-advance.ts
│   ├── use-story-history.ts
│   └── use-story-cards.ts
└── hub/
    ├── index.ts
    ├── use-hub-profile.ts
    ├── use-hub-stories.ts
    └── use-resources.ts
```

**Import from barrel:** `import { useResources, useStoryEngine, ... } from '@/hooks'`

## Hook Categories

### Game (`hooks/game/`)

- **use-thought-defender-game.ts** — Main game logic for the Vantage/Thought Defender mini-game. Handles all game state, collision detection, enemy spawning, boss mechanics, power-ups, fragments, and the game loop. Manages the entire game experience with Affective-DDA integration. Composes `hooks/game/vantage/` submodules.

- **use-game-director.ts** — Dynamic Difficulty Adjustment (DDA) system for the mini-game. Syncs game inputs into the game-director store, runs DDA/EI intervals, and returns current metrics. Calculates pressure scores, emotional intensity, and adjusts difficulty in real-time.

### Story (`hooks/story/`)

- **use-story-engine.ts** — Core story engine. Manages story flow, passage loading, and choice making. Handles API calls with retry logic, error handling, and state management. Helpers live in `utils/story-helpers.ts`.

- **use-story-auto-advance.ts** — Handles auto-advancing "Continue" choices. Calculates delay from text speed and content length.

- **use-story-history.ts** — Tracks story history (passages and choices). Filters out "Continue" choices.

- **use-story-cards.ts** — Transforms story data into card format for the hub. Daily unlock system based on user creation date.

### Hub (`hooks/hub/`)

- **use-hub-profile.ts** — Loads user profile from API and maps it to lumens in the game store.

- **use-hub-stories.ts** — Fetches all stories for the hub via React Query. Caching and stale time management.

- **use-resources.ts** — Aggregates data for the resources page. Fetches profile, stories, journal; reads game-store; delegates transformation to `utils/resources-mapper`.

### System (root)

- **use-notifications.ts** — Push notifications. Permission requests, scheduling, backend sync, user preferences, notification listeners.

## Refactor Plan

- [x] Split use-thought-defender-game into smaller hooks (vantage submodules)
- [x] Extract constants into vantage-constants.ts
- [x] Consolidate retry logic; move helpers to utils/story-helpers.ts
- [x] Add TypeScript interfaces for hook return types (types/hooks.ts)
- [x] Move data transformation from use-resources to utils/resources-mapper
- [x] Add index.ts barrel for hook exports
- [x] Create hooks directory structure (game/, story/, hub/)
- [ ] Add JSDoc comments to all exported hooks for better IDE support

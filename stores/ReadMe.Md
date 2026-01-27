# Stores Directory

Global/shared Zustand state management stores. For more information, see:
https://zustand.docs.pmnd.rs/getting-started/introduction

## Organization Principles

**Stores vs Hooks:**
- **Stores** (`stores/`) = Global/shared state that needs to be accessed across multiple components or persisted
- **Hooks** (`hooks/`) = Component logic, data fetching, side effects, and component-scoped state

While Zustand stores are technically hooks (they use `create()` which returns a hook), we organize them separately:
- **Global stores** → `stores/` (persisted or session-wide state)
- **Component-scoped stores** → Created within hooks in `hooks/` (e.g., `vantage-store.ts`)

## Store Files

- **auth-store.ts** - Authentication state management
  - User ID and token storage
  - Authentication actions (setUser, clearAuth, isAuthenticated)
  - Persisted with AsyncStorage

- **game-store.ts** - Main game state management
  - Character data and progression
  - Story and journal state
  - Lumens
  - Powers and memories
  - App settings (sound, text speed, notifications)
  - Persisted with AsyncStorage

- **dda-game-store.ts** - Dynamic Difficulty Adjustment state
  - Session-only state (not persisted)
  - Pressure scores, emotional intensity, difficulty metrics
  - Resets when game stops



Refactor plan : 

[] Types in type folder 
[] main index barrel 

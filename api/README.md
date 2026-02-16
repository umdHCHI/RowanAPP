# API Structure Documentation

This directory contains the complete backend API integration structure for The Archive application.

## Structure

```
api/
├── client.ts              # Base API client with error handling and retries
├── constants.ts           # API configuration and endpoint definitions
├── types.ts               # TypeScript types and Zod schemas
├── index.ts              # Main export file
├── services/             # Service modules for each data type
│   ├── character.service.ts
│   ├── story.service.ts
|   |---ema.service.ts
│   |___game.service.ts
│   |___user.service.ts
│   └── journal.service.ts
└── hooks/                # React Query hooks
    ├── use-character.ts
    ├── use-story.ts
    ├── use-ema.ts
    ├── use-auth.ts
    └── use-journal.ts
    └── use-game.ts
    └── use-login.ts
    └── use-lumens.ts
    └── use-require-auth.ts
    └── use-user.ts
```

## Setup

### 1. Configure API Base URL

Update the .env file at the root of the dir.

Constants.ts should point to this file to grab the backend URI

## Usage

### Using React Query Hooks

The hooks are the recommended way to interact with the API:

```typescript
import { useCharacters, useCreateCharacter } from '@/api'

function CharacterList() {
  // Fetch data
  const { data: characters, isLoading, error } = useCharacters()

  // Mutations
  const createCharacter = useCreateCharacter()

  const handleCreate = async () => {
    try {
      const newCharacter = await createCharacter.mutateAsync({
        name: 'My Character',
        avatar: 'path/to/avatar.png',
      })
      console.log('Created:', newCharacter)
    } catch (error) {
      console.error('Failed to create:', error)
    }
  }

  if (isLoading) return <Text>Loading...</Text>
  if (error) return <Text>Error: {error.message}</Text>

  return (
    // Your UI
  )
}
```

### Using Services Directly

You can also use services directly if you need more control:

```typescript
import { characterService } from "@/api";

async function fetchCharacter(id: string) {
  try {
    const response = await characterService.getById(id);
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
```

## Available Hooks

### Character Hooks

- `useCharacters()` - Get all characters

- `useCreateCharacter()` - Create new character
- `useUpdateCharacter()` - Update character
- `useDeleteCharacter()` - Delete character

### Story Hooks

- `useStoryProgress()` - Get current story progress
- `useUpdateStoryProgress()` - Update story progress

### Journal Hooks

- `useJournalEntries(page, limit)` - Get paginated journal entries
- `useJournalEntry(id)` - Get journal entry by ID
- `useCreateJournalEntry()` - Create journal entry
- `useUpdateJournalEntry()` - Update journal entry
- `useDeleteJournalEntry()` - Delete journal entry

## Error Handling

All hooks and services throw user-friendly errors that can be caught and displayed:

```typescript
const { error } = useCharacters()

if (error) {
  // error.message contains a user-friendly message
  return <Text>Error: {error.message}</Text>
}
```

## Integration with Zustand

You can sync API data with your Zustand store:

```typescript
import { useCharacters } from "@/api";
import { useGameStore } from "@/stores/game-store";

function CharacterSync() {
  const { data: characters } = useCharacters();
  const setCharacter = useGameStore((state) => state.setCharacter);

  useEffect(() => {
    if (characters && characters.length > 0) {
      // Sync with Zustand store
      setCharacter(characters[0]);
    }
  }, [characters, setCharacter]);

  return null;
}
```

## Type Safety

All API responses are typed with TypeScript and validated with Zod schemas. The types are exported from `api/types.ts` and can be used throughout your application.

## Customization

### Adding New Endpoints

1. Add endpoint to `API_ENDPOINTS` in `constants.ts`
2. Create a service method in the appropriate service file
3. Create React Query hooks in the appropriate hooks file
4. Export from `api/index.ts`

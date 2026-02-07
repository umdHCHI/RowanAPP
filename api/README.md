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
│   ├── equipment.service.ts
│   ├── attributes.service.ts
│   └── journal.service.ts
└── hooks/                # React Query hooks
    ├── use-character.ts
    ├── use-story.ts
    ├── use-equipment.ts
    ├── use-attributes.ts
    └── use-journal.ts
```

## Setup

### 1. Configure API Base URL

Update the `API_CONFIG.BASE_URL` in `api/constants.ts` or set the `EXPO_PUBLIC_API_URL` environment variable:

```typescript
// In api/constants.ts
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com',
  // ...
}
```

### 2. Update Endpoints

As you receive your working endpoints, update the `API_ENDPOINTS` object in `api/constants.ts`:

```typescript
export const API_ENDPOINTS = {
  CHARACTERS: '/characters',
  // Add your endpoints here
}
```

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
import { characterService } from '@/api'

async function fetchCharacter(id: string) {
  try {
    const response = await characterService.getById(id)
    if (response.success) {
      return response.data
    }
  } catch (error) {
    console.error('Error:', error)
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

### Equipment Hooks
- `useEquipment()` - Get all equipment
- `useUnlockedEquipment()` - Get unlocked equipment only
- `useEquipmentById(id)` - Get equipment by ID
- `useUnlockEquipment()` - Unlock equipment

### Attributes Hooks
- `useAttributes()` - Get current attributes
- `useUpdateAttributes()` - Update attributes

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
import { useCharacters } from '@/api'
import { useGameStore } from '@/stores/game-store'

function CharacterSync() {
  const { data: characters } = useCharacters()
  const setCharacter = useGameStore((state) => state.setCharacter)
  
  useEffect(() => {
    if (characters && characters.length > 0) {
      // Sync with Zustand store
      setCharacter(characters[0])
    }
  }, [characters, setCharacter])
  
  return null
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

### Modifying Request Behavior

The `apiClient` in `client.ts` can be customized:
- Change timeout: `apiClient.setBaseURL(newUrl)`
- Add authentication headers
- Modify retry logic
- Add request/response interceptors

## Next Steps

1. Update `API_CONFIG.BASE_URL` with your actual API URL
2. Update `API_ENDPOINTS` as you receive endpoint definitions
3. Test the hooks in your components
4. Integrate with your Zustand store as needed

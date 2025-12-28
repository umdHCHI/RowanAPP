# API Integration Quick Start Guide

## Step 1: Test Your Connection ✅

I've created a test screen for you. Here's how to use it:

1. **Add the test route** to your `app/_layout.tsx`:
   ```typescript
   <Stack.Screen name="api-test" />
   ```

2. **Navigate to the test screen** in your app (or add a temporary button):
   ```typescript
   router.push('/api-test')
   ```

3. **Run the tests** to see:
   - What endpoints are reachable
   - What the actual API structure looks like
   - Any CORS or authentication issues

## Step 2: Verify Your API Structure

Based on your base URL `http://131.212.41.8/api/`, your endpoints will be constructed as:
- `http://131.212.41.8/api/v1/characters`
- `http://131.212.41.8/api/v1/story`
- etc.

**Questions to answer:**
- Does your API use `/v1/` versioning? If not, update `API_CONFIG.VERSION` in `constants.ts`
- What are the actual endpoint paths? Update `API_ENDPOINTS` accordingly
- Does your API require authentication? (See Step 3)

## Step 3: Handle Authentication (if needed)

If your API requires authentication, you'll need to:

1. **Add auth token to requests** - Update `api/client.ts`:
   ```typescript
   // In the request method, add headers:
   const token = await getAuthToken() // Your auth method
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`, // or your auth format
   }
   ```

2. **Store auth tokens** - Use AsyncStorage or your preferred method

## Step 4: Update Endpoint Paths

Once you know your actual endpoints, update `api/constants.ts`:

```typescript
export const API_ENDPOINTS = {
  CHARACTERS: '/characters',  // Change to match your API
  // ... etc
}
```

## Step 5: Test with Real Data

After endpoints are confirmed:

1. **Use the hooks in a component**:
   ```typescript
   import { useCharacters } from '@/api'
   
   function MyComponent() {
     const { data, isLoading, error } = useCharacters()
     // Use the data
   }
   ```

2. **Check the response format** - Your API might return data differently than expected. Update the types in `api/types.ts` if needed.

## Step 6: Handle Response Format Differences

If your API returns data in a different format, you have two options:

**Option A: Update the service methods** to transform the response:
```typescript
async getAll(): Promise<ApiResponse<CharacterResponse[]>> {
  const response = await apiClient.get<CharacterResponse[]>(API_ENDPOINTS.CHARACTERS)
  // Transform if needed
  return {
    ...response,
    data: response.data.map(transformCharacter)
  }
}
```

**Option B: Update the types** to match your API's actual response structure.

## Common Issues & Solutions

### CORS Errors
- Your backend needs to allow requests from your app's origin
- For development, you might need to configure CORS on your server

### 404 Not Found
- Check the endpoint paths match your backend exactly
- Verify the API version (`/v1/`) is correct
- Check if your base URL should end with `/api/` or just `/api`

### Authentication Errors
- Verify token format and header name
- Check token expiration
- Ensure token is being sent with requests

### Network Errors
- Verify the IP address is accessible from your device/emulator
- Check if you need to use `http://` vs `https://`
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For iOS simulator, `localhost` should work

## Next Steps After Testing

1. ✅ Remove the test screen (`app/api-test.tsx`) once confirmed
2. ✅ Update endpoint paths to match your backend
3. ✅ Add authentication if needed
4. ✅ Start using hooks in your actual components
5. ✅ Sync API data with Zustand store as needed

## Need Help?

Check the console logs when running tests - they'll show you:
- The exact URLs being called
- Response status codes
- Error messages
- Response data structure

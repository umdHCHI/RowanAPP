process.env.API_BASE_URL = 'http://131.212.41.8/api/';


//user token for admin 
const AsyncStorage = require('@react-native-async-storage/async-storage');
AsyncStorage.setItem('authToken', '8a71299900898a32febbca89ef5638a406475348');


// Mocking AsyncStorage for Jest tests
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-constants for Jest tests
jest.mock('expo-constants', () => ({
  expoConfig: { extra: { API_BASE_URL: 'http://131.212.41.8/api/' } },
  manifest: { extra: { API_BASE_URL: 'http://131.212.41.8/api/' } },
}));
// Export all services from a single location for cleaner imports

// Main API service (consolidated)
export { apiService } from './apiService';

// API configuration
export { API_ENDPOINTS, apiBaseUrl, getApiUrl } from './apiConfig';

// Appearance service
export { appearanceService } from './appearanceService';

// Archive service
export { archiveService } from './archiveService';

// Onboarding service functions
export {
    completeOnboarding, createProfile, getProfile, updateProfile
} from './onboardingService';

// Research group service
export { researchGroupService } from './researchGroupService';


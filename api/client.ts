import { API_CONFIG } from './constants'
import type { ApiResponse, ApiError } from './types'

/**
 * Get Authorization header for DRF Token Authentication
 * Backend format: Authorization: Token <token>
 * 
 * Priority:
 * 1. Token from auth store (user logged in)
 * 2. Config token (development fallback)
 */
function getAuthHeader(): string {
  // Try to get token from auth store first (user logged in)
  try {
    // Dynamic import to avoid circular dependency
    const { useAuthStore } = require('../stores/auth-store')
    const authState = useAuthStore.getState()
    
    if (authState.token && authState.token.trim()) {
      // Using DRF Token authentication
      return `Token ${authState.token}`
    }
  } catch (error) {
    // If store is not available, fall back to config token
  }
  
  // Fallback to config token (for development/backward compatibility)
  const token = API_CONFIG.AUTH_TOKEN
  if (token && token.trim()) {
    // Using DRF Token authentication
    return `Token ${token}`
  }
  
  return ''
}

/**
 * HTTP Methods
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Request Options
 */
interface RequestOptions extends RequestInit {
  timeout?: number
  retries?: number
  skipAuth?: boolean
  useRootBase?: boolean
  suppressErrorLog?: boolean // Suppress error logging for expected errors (e.g., 404s on optional endpoints)
}

/**
 * API Client Class
 * Handles all HTTP requests with error handling, retries, and timeout
 */
class ApiClient {
  private apiBaseURL: string
  private rootBaseURL: string
  private timeout: number
  private maxRetries: number

  constructor() {
    // Validate env vars on client creation - provide helpful error if missing
    // Note: AUTH_TOKEN is now optional if using JWT login
    if (!API_CONFIG.BASE_URL) {
      console.error(
        `Missing required environment variable: EXPO_PUBLIC_API_URL\n` +
        `Please ensure your .env file exists at:\n` +
        `C:\\dev\\coding\\react_native\\betwixtclone\\thearchive\\.env\n\n` +
        `After creating/updating .env, restart the Expo dev server with: npm start -- --clear`
      )
    }
    
    this.apiBaseURL = API_CONFIG.BASE_URL || ''
    this.rootBaseURL = API_CONFIG.ROOT_URL || ''
    this.timeout = API_CONFIG.TIMEOUT
    this.maxRetries = API_CONFIG.MAX_RETRIES
  }

  /**
   * Get full URL for endpoint
   */
  private getUrl(endpoint: string, skipVersion = false, useRootBase = false): string {
    if (/^https?:\/\//i.test(endpoint)) return endpoint

    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    
    // Handle base URL with or without trailing slash
    const selectedBase = useRootBase ? this.rootBaseURL : this.apiBaseURL
    const baseUrl = selectedBase.endsWith('/')
      ? selectedBase.slice(0, -1)
      : selectedBase
    
    // Construct URL - skip version by default since API_CONFIG.VERSION doesn't exist
    // If versioning is needed in the future, add VERSION to API_CONFIG
    return `${baseUrl}/${cleanEndpoint}`
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`))
      }, timeout)
    })
  }

  /**
   * Handle API errors
   * @param suppressLog - When true, skip console.error (e.g. expected 401 on login). Caller still receives thrown error.
   */
  private async handleError(response: Response, suppressLog = false): Promise<ApiError> {
    let errorData: ApiError

    const contentType = response.headers.get('content-type') || ''
    const isHTML = contentType.includes('text/html')

    try {
      const clonedResponse = response.clone()

      if (isHTML) {
        const text = await clonedResponse.text()
        if (!suppressLog) console.error('API Error Response (HTML):', text.substring(0, 500))

        const errorMatch = text.match(/<pre[^>]*>([^<]+)<\/pre>/i) ||
          text.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
          text.match(/Error:\s*([^\n<]+)/i)
        const extractedMessage = errorMatch ? errorMatch[1].trim() : null

        errorData = {
          message: extractedMessage || `HTTP ${response.status}: ${response.statusText || 'Internal Server Error'}`,
          status: response.status,
        }
      } else {
        const data = await clonedResponse.json()
        if (!suppressLog) console.error('API Error Response Data (JSON):', JSON.stringify(data, null, 2))

        errorData = {
          message: data.message || data.detail || data.error || data.error_message || `HTTP ${response.status}: ${response.statusText}`,
          code: data.code,
          status: response.status,
          errors: data.errors || data.non_field_errors || data,
        }
      }
    } catch (parseError) {
      try {
        const clonedResponse = response.clone()
        const text = await clonedResponse.text()
        if (!suppressLog) {
          console.error('API Error Response Text (raw):', text.substring(0, 500))
          console.error('Response headers:', Object.fromEntries(response.headers.entries()))
        }
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText || 'Internal Server Error'}`,
          status: response.status,
        }
      } catch (textError) {
        if (!suppressLog) console.error('Failed to read error response:', textError)
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText || 'Internal Server Error'}`,
          status: response.status,
        }
      }
    }

    const error = new Error(errorData.message) as Error & ApiError
    Object.assign(error, errorData)
    return error as ApiError
  }

  /**
   * Make HTTP request with retry logic
   */
  private async request<T>(
    endpoint: string,
    method: HttpMethod = 'GET',
    body?: unknown,
    options: RequestOptions & { skipVersion?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    // Validate configuration before making request
    if (!this.apiBaseURL) {
      throw new Error(
        'API base URL is not configured. Please set EXPO_PUBLIC_API_URL in your .env file.\n' +
        'Location: C:\\dev\\coding\\react_native\\betwixtclone\\thearchive\\.env'
      )
    }
    
    const {
      timeout = this.timeout,
      retries = this.maxRetries,
      skipVersion = false,
      skipAuth = false,
      useRootBase = false,
      suppressErrorLog = false,
      ...fetchOptions
    } = options

    const url = this.getUrl(endpoint, skipVersion, useRootBase)
    const authHeader = skipAuth ? '' : getAuthHeader()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(authHeader && { Authorization: authHeader }),
      ...fetchOptions.headers,
    }

    const config: RequestInit = {
      method,
      headers,
      ...fetchOptions,
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    let lastError: Error | ApiError | null = null

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Race between fetch and timeout
        const response = await Promise.race([
          fetch(url, config),
          this.createTimeoutPromise(timeout),
        ]) as Response

        // Handle non-2xx responses
        if (!response.ok) {
          const error = await this.handleError(response, suppressErrorLog)
          lastError = error
          
          // Log error details for debugging (unless suppressed for expected errors)
          if (!suppressErrorLog) {
            console.error('API Error Response:', {
              url,
              method,
              status: response.status,
              statusText: response.statusText,
              error,
            })
          }

          // Don't retry on 4xx errors (client errors)
          if (response.status >= 400 && response.status < 500) {
            throw error
          }

          // Retry on 5xx errors or network errors
          if (attempt < retries) {
            await new Promise((resolve) =>
              setTimeout(resolve, API_CONFIG.RETRY_DELAY * (attempt + 1))
            )
            continue
          }

          throw error
        }

        // Parse successful response (some endpoints return 204 No Content)
        if (response.status === 204) {
          return { success: true, data: null } as unknown as ApiResponse<T>
        }

        const contentType = response.headers.get('content-type') || ''
        const hasJson = contentType.includes('application/json')

        // If server didn't send JSON, return a minimal success wrapper
        if (!hasJson) {
          const text = await response.text()
          return ({ success: true, data: text } as unknown) as ApiResponse<T>
        }

        const data = await response.json()
        return data
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Don't retry on timeout or network errors if we've exhausted retries
        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, API_CONFIG.RETRY_DELAY * (attempt + 1))
          )
          continue
        }

        // If it's the last attempt, throw the error
        if (attempt === retries) {
          throw lastError
        }
      }
    }

    throw lastError || new Error('Request failed after all retries')
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions & { skipVersion?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, options)
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions & { skipVersion?: boolean }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', body, options)
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions & { skipVersion?: boolean }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', body, options)
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions & { skipVersion?: boolean }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', body, options)
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options?: RequestOptions & { skipVersion?: boolean }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, options)
  }

  /**
   * Update base URL (useful for testing or dynamic configuration)
   */
  setBaseURL(url: string): void {
    this.apiBaseURL = url
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

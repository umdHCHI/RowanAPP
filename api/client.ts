import { API_CONFIG } from './constants'
import type { ApiResponse, ApiError } from './types'

/**
 * Get Authorization header
 */
function getAuthHeader(): string {
  if (API_CONFIG.AUTH_TOKEN) {
    // Using Token authentication (common for Django REST Framework)
    return `Token ${API_CONFIG.AUTH_TOKEN}`
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
}

/**
 * API Client Class
 * Handles all HTTP requests with error handling, retries, and timeout
 */
class ApiClient {
  private baseURL: string
  private timeout: number
  private maxRetries: number

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
    this.maxRetries = API_CONFIG.MAX_RETRIES
  }

  /**
   * Get full URL for endpoint
   */
  private getUrl(endpoint: string, skipVersion = false): string {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    
    // Handle base URL with or without trailing slash
    const baseUrl = this.baseURL.endsWith('/') 
      ? this.baseURL.slice(0, -1) 
      : this.baseURL
    
    // Construct URL with or without version
    if (skipVersion) {
      return `${baseUrl}/${cleanEndpoint}`
    }
    return `${baseUrl}/${API_CONFIG.VERSION}/${cleanEndpoint}`
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
   */
  private async handleError(response: Response): Promise<ApiError> {
    let errorData: ApiError

    // Check content type to determine how to parse the response
    const contentType = response.headers.get('content-type') || ''
    const isHTML = contentType.includes('text/html')

    try {
      // Clone the response so we can read it multiple times if needed
      const clonedResponse = response.clone()
      
      if (isHTML) {
        // If it's HTML (like Django error page), extract text and look for error info
        const text = await clonedResponse.text()
        console.error('API Error Response (HTML):', text.substring(0, 500)) // Log first 500 chars
        
        // Try to extract error message from HTML (Django debug pages often have error info)
        const errorMatch = text.match(/<pre[^>]*>([^<]+)<\/pre>/i) || 
                          text.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                          text.match(/Error:\s*([^\n<]+)/i)
        
        const extractedMessage = errorMatch ? errorMatch[1].trim() : null
        
        errorData = {
          message: extractedMessage || `HTTP ${response.status}: ${response.statusText || 'Internal Server Error'}`,
          status: response.status,
        }
      } else {
        // Try to parse as JSON
        const data = await clonedResponse.json()
        console.error('API Error Response Data (JSON):', JSON.stringify(data, null, 2))
        
        errorData = {
          message: data.message || data.detail || data.error || data.error_message || `HTTP ${response.status}: ${response.statusText}`,
          code: data.code,
          status: response.status,
          errors: data.errors || data.non_field_errors || data,
        }
      }
    } catch (parseError) {
      // If parsing fails, try to get text
      try {
        const clonedResponse = response.clone()
        const text = await clonedResponse.text()
        console.error('API Error Response Text (raw):', text.substring(0, 500))
        console.error('Response headers:', Object.fromEntries(response.headers.entries()))
        
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText || 'Internal Server Error'}`,
          status: response.status,
        }
      } catch (textError) {
        console.error('Failed to read error response:', textError)
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText || 'Internal Server Error'}`,
          status: response.status,
        }
      }
    }

    // Create a proper Error object with all the error data
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
    const { timeout = this.timeout, retries = this.maxRetries, skipVersion = false, ...fetchOptions } = options

    const url = this.getUrl(endpoint, skipVersion)
    const authHeader = getAuthHeader()
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
          const error = await this.handleError(response)
          lastError = error
          
          // Log error details for debugging
          console.error('API Error Response:', {
            url,
            method,
            status: response.status,
            statusText: response.statusText,
            error,
          })

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

        // Parse successful response
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
    this.baseURL = url
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

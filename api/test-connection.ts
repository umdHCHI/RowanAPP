/**
 * API Connection Test Utility
 * 
 * Use this to test your backend connection and discover available endpoints.
 * Run this in a component or test file to verify your API setup.
 */

import { apiClient } from './client'
import { API_CONFIG, API_ENDPOINTS } from './constants'

/**
 * Test basic API connection
 */
export async function testApiConnection() {
  console.log('🔍 Testing API Connection...')
  console.log('Base URL:', API_CONFIG.BASE_URL)
  console.log('API Version:', API_CONFIG.VERSION)
  
  try {
    // Test a simple GET request (adjust endpoint based on what's available)
    // Try a health check or root endpoint first
    const testEndpoints = [
      '', // Root
      'health',
      'status',
      API_ENDPOINTS.CHARACTERS,
    ]
    
    for (const endpoint of testEndpoints) {
      try {
        const url = endpoint 
          ? `${API_CONFIG.BASE_URL}${API_CONFIG.VERSION}/${endpoint}`
          : `${API_CONFIG.BASE_URL}${API_CONFIG.VERSION}`
        
        console.log(`\n📡 Testing: ${url}`)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        console.log(`   Status: ${response.status} ${response.statusText}`)
        console.log(`   Headers:`, Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          const data = await response.text()
          try {
            const json = JSON.parse(data)
            console.log(`   ✅ Success! Response:`, json)
            return { success: true, endpoint, data: json }
          } catch {
            console.log(`   ✅ Success! Response (text):`, data)
            return { success: true, endpoint, data }
          }
        } else {
          const errorText = await response.text()
          console.log(`   ❌ Error:`, errorText)
        }
      } catch (error) {
        console.log(`   ❌ Failed:`, error instanceof Error ? error.message : error)
      }
    }
    
    return { success: false, message: 'No working endpoints found' }
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }
  }
}

/**
 * Test API client with a specific endpoint
 */
export async function testApiClient(endpoint: string) {
  console.log(`\n🧪 Testing API Client with endpoint: ${endpoint}`)
  
  try {
    const response = await apiClient.get(endpoint)
    console.log('✅ API Client Response:', response)
    return response
  } catch (error) {
    console.error('❌ API Client Error:', error)
    throw error
  }
}

/**
 * Get the full URL that will be constructed for an endpoint
 */
export function getFullUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL
  return `${baseUrl}/${API_CONFIG.VERSION}/${cleanEndpoint}`
}

/**
 * Log all configured endpoints with their full URLs
 */
export function logConfiguredEndpoints() {
  console.log('\n📋 Configured Endpoints:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const endpoints = [
    { name: 'CHARACTERS', path: API_ENDPOINTS.CHARACTERS },
    { name: 'STORY', path: API_ENDPOINTS.STORY },
    { name: 'STORY_PROGRESS', path: API_ENDPOINTS.STORY_PROGRESS },
    { name: 'EQUIPMENT', path: API_ENDPOINTS.EQUIPMENT },
    { name: 'ATTRIBUTES', path: API_ENDPOINTS.ATTRIBUTES },
    { name: 'JOURNAL_ENTRIES', path: API_ENDPOINTS.JOURNAL_ENTRIES },
  ]
  
  endpoints.forEach(({ name, path }) => {
    console.log(`${name.padEnd(20)} → ${getFullUrl(path)}`)
  })
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

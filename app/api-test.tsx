/**
 * API Connection Test Screen
 * 
 * This is a temporary screen to test your API connection.
 * You can navigate to this screen to verify everything is working.
 * Delete this file once you've confirmed your API is connected.
 */

import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useState } from 'react'
import { testApiConnection, testApiClient, logConfiguredEndpoints, getFullUrl } from '../api/test-connection'
import { API_ENDPOINTS } from '../api/constants'

export default function ApiTestScreen() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTestConnection = async () => {
    setIsLoading(true)
    setTestResult('Testing connection...\n')
    
    try {
      logConfiguredEndpoints()
      const result = await testApiConnection()
      setTestResult((prev) => prev + `\nResult: ${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      setTestResult((prev) => prev + `\nError: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestEndpoint = async (endpoint: string) => {
    setIsLoading(true)
    setTestResult(`Testing endpoint: ${endpoint}\nFull URL: ${getFullUrl(endpoint)}\n`)
    
    try {
      const result = await testApiClient(endpoint)
      setTestResult((prev) => prev + `\n✅ Success:\n${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      setTestResult((prev) => prev + `\n❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connection Test</Text>
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleTestConnection}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Test Individual Endpoints:</Text>
      
      <View style={styles.endpointList}>
        <TouchableOpacity 
          style={styles.endpointButton}
          onPress={() => handleTestEndpoint(API_ENDPOINTS.CHARACTERS)}
        >
          <Text style={styles.endpointText}>Test Characters</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.endpointButton}
          onPress={() => handleTestEndpoint(API_ENDPOINTS.STORY)}
        >
          <Text style={styles.endpointText}>Test Story</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.endpointButton}
          onPress={() => handleTestEndpoint(API_ENDPOINTS.EQUIPMENT)}
        >
          <Text style={styles.endpointText}>Test Equipment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.endpointButton}
          onPress={() => handleTestEndpoint(API_ENDPOINTS.ATTRIBUTES)}
        >
          <Text style={styles.endpointText}>Test Attributes</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultContainer}>
        <Text style={styles.resultText}>{testResult || 'No test results yet. Click a button above to test.'}</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  endpointList: {
    gap: 10,
    marginBottom: 20,
  },
  endpointButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
  },
  endpointText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
  },
  resultText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
})

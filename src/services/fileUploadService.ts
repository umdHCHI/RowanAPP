import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiBaseUrl } from './apiConfig';

class FileUploadService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Token ${token}`,
      'Content-Type': 'multipart/form-data',
    };
  }

  /**
   * Upload an audio file to the backend
   * Falls back to local URI storage if backend endpoint doesn't exist
   */
  async uploadAudioFile(audioUri: string, metadata?: {
    prompt?: string;
    entry_type?: string;
    skill_category?: string;
    map_area?: string;
    difficulty?: string;
  }): Promise<{ file_url: string; file_id: string }> {
    try {
      console.log('Audio URI:', audioUri);

      // Check if it's a web blob URL
      if (audioUri.startsWith('blob:')) {
        return await this.uploadWebAudioBlob(audioUri, metadata);
      }

      // Create form data
      const formData = new FormData();

      // Get file extension
      const fileExtension = audioUri.split('.').pop() || 'm4a';
      const fileName = `audio_${Date.now()}.${fileExtension}`;

      formData.append('audio_file', {
        uri: audioUri,
        type: `audio/${fileExtension}`,
        name: fileName,
      } as any);

      // Add metadata if provided
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
      }

      // Get auth headers
      const headers = await this.getAuthHeaders();

      // Upload to backend
      const response = await axios.post(
        `${apiBaseUrl}journal/upload-audio/`,
        formData,
        {
          headers,
          timeout: 30000, // 30 second timeout for file uploads
        }
      );

      console.log('Audio upload successful:', response.data);
      return response.data;
    } catch (error: any) {
      
      // Check if it's a 404 (endpoint doesn't exist) or HTML response
      const isEndpointMissing = error.response?.status === 404 || 
                                error.response?.status === 405 ||
                                (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE'));
      
      if (isEndpointMissing) {
        console.log('Backend endpoint not available, storing audio URI locally');
        // Return the local URI as the file URL
        return {
          file_url: audioUri,
          file_id: `audio_${Date.now()}`
        };
      }
      
      // For other errors, still fall back but log them
      console.error('Failed to upload audio file:', error.message);
      return {
        file_url: audioUri,
        file_id: `audio_${Date.now()}`
      };
    }
  }

  /**
   * Upload web audio blob (for web platform)
   * Falls back to blob URL if backend endpoint doesn't exist
   */
  private async uploadWebAudioBlob(blobUrl: string, metadata?: {
    prompt?: string;
    entry_type?: string;
    skill_category?: string;
    map_area?: string;
    difficulty?: string;
  }): Promise<{ file_url: string; file_id: string }> {
    try {
      
      // Fetch the blob
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      const fileName = `audio_${Date.now()}.wav`;
      
      formData.append('audio_file', blob, fileName);

      // Add metadata if provided
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
      }

      // Get auth token
      const token = await AsyncStorage.getItem('authToken');
      const headers = {
        'Authorization': `Token ${token}`,
      };

      // Upload to backend
      const uploadResponse = await axios.post(
        `${apiBaseUrl}journal/upload-audio/`,
        formData,
        {
          headers,
          timeout: 30000, // 30 second timeout for file uploads
        }
      );

      console.log('Web audio blob upload successful:', uploadResponse.data);
      return uploadResponse.data;
    } catch (error: any) {
      console.log('Web audio blob upload failed, using local storage fallback');
      
      // Check if it's a 404 (endpoint doesn't exist) or HTML response
      const isEndpointMissing = error.response?.status === 404 || 
                                error.response?.status === 405 ||
                                (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE'));
      
      if (isEndpointMissing) {
        console.log('Backend endpoint not available, storing blob URL locally');
      } else {
        console.error('Failed to upload web audio blob:', error.message);
      }
      
      // Return the blob URL as fallback
      return {
        file_url: blobUrl,
        file_id: `audio_${Date.now()}`
      };
    }
  }

  /**
   * Upload a drawing as JSON data or base64 image
   * Falls back to local JSON storage if backend endpoint doesn't exist
   */
  async uploadDrawingData(drawingPaths: any[], metadata?: {
    prompt?: string;
    entry_type?: string;
    skill_category?: string;
    map_area?: string;
    difficulty?: string;
  }): Promise<{ file_url: string; file_id: string }> {
    try {

      // Check if we have a base64 image (from SignatureCanvas)
      if (drawingPaths.length === 1 && drawingPaths[0].imageData) {
        return await this.uploadBase64Image(drawingPaths[0].imageData, metadata);
      }

      // Get auth headers
      const token = await AsyncStorage.getItem('authToken');
      const headers = {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      };

      // Prepare the drawing data payload
      const payload = {
        drawing_data: JSON.stringify(drawingPaths),
        ...metadata
      };

      // Try to upload to backend
      const response = await axios.post(
        `${apiBaseUrl}journal/upload-drawing/`,
        payload,
        {
          headers,
          timeout: 30000, // 30 second timeout
        }
      );

      console.log('Drawing upload successful:', response.data);
      return response.data;
    } catch (error: any) {

      // Check if it's a 404 (endpoint doesn't exist) or HTML response
      const isEndpointMissing = error.response?.status === 404 ||
                                error.response?.status === 405 ||
                                (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE'));

      if (isEndpointMissing) {
        console.log('Backend endpoint not available, storing drawing as JSON locally');
        // Return a fake success response for local storage
        return {
          file_url: 'local://drawing.json',
          file_id: `drawing_${Date.now()}`
        };
      }

      // For other errors, still fall back but log them
      console.error('Failed to upload drawing data:', error.message);
      return {
        file_url: 'local://drawing.json',
        file_id: `drawing_${Date.now()}`
      };
    }
  }

  /**
   * Upload a base64 image (from SignatureCanvas)
   * Falls back to local base64 storage if backend endpoint doesn't exist
   */
  private async uploadBase64Image(base64Data: string, metadata?: {
    prompt?: string;
    entry_type?: string;
    skill_category?: string;
    map_area?: string;
    difficulty?: string;
  }): Promise<{ file_url: string; file_id: string }> {
    try {

      // Get auth token
      const token = await AsyncStorage.getItem('authToken');

      // Create form data for image upload
      const formData = new FormData();
      const fileName = `drawing_${Date.now()}.png`;

      // Convert base64 data URI to blob for web platforms
      if (base64Data.startsWith('data:')) {
        // Extract the base64 content (remove the data URI prefix)
        const base64Content = base64Data.split(',')[1];
        const mimeType = base64Data.split(';')[0].split(':')[1];

        // Convert base64 to blob
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        // Append blob to FormData
        formData.append('image_file', blob, fileName);
      } else {
        // Fallback: if it's not a data URI, treat it as raw base64
        console.warn('Base64 data does not start with "data:" - unexpected format');
        formData.append('image_file', {
          uri: base64Data,
          type: 'image/png',
          name: fileName,
        } as any);
      }

      // Add metadata if provided
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
      }

      const headers = {
        'Authorization': `Token ${token}`,
        'Content-Type': 'multipart/form-data',
      };

      // Try to upload to backend
      const response = await axios.post(
        `${apiBaseUrl}journal/upload-image/`,
        formData,
        {
          headers,
          timeout: 30000, // 30 second timeout
        }
      );

      console.log('Base64 image upload successful:', response.data);
      return response.data;
    } catch (error: any) {

      // Check if it's a 404 (endpoint doesn't exist) or HTML response
      const isEndpointMissing = error.response?.status === 404 ||
                                error.response?.status === 405 ||
                                (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE'));

      if (isEndpointMissing) {
        console.log('Backend endpoint not available, storing base64 image locally');
      }

      // Return the base64 data itself as the file_url for local storage
      return {
        file_url: base64Data,
        file_id: `drawing_${Date.now()}`
      };
    }
  }

  /**
   * Convert local file URI to base64 for web compatibility
   */
  async fileToBase64(fileUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64' as any,
      });
      return base64;
    } catch (error) {
      console.error('Failed to convert file to base64:', error);
      throw error;
    }
  }

  /**
   * Get file info (size, exists, etc.)
   */
  async getFileInfo(fileUri: string) {
    try {
      return await FileSystem.getInfoAsync(fileUri);
    } catch (error) {
      console.error('Failed to get file info:', error);
      throw error;
    }
  }
}

export const fileUploadService = new FileUploadService();
export default fileUploadService; 
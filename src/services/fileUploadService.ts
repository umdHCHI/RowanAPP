import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
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
   */
  async uploadAudioFile(audioUri: string, metadata?: {
    prompt?: string;
    entry_type?: string;
    skill_category?: string;
    map_area?: string;
    difficulty?: string;
  }): Promise<{ file_url: string; file_id: string }> {
    try {
      console.log('=== UPLOADING AUDIO FILE ===');
      console.log('Audio URI:', audioUri);
      console.log('Metadata:', metadata);

      // Create form data
      const formData = new FormData();
      
      // Add the audio file
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file does not exist');
      }

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
      console.error('Failed to upload audio file:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Upload a drawing as JSON data
   */
  async uploadDrawingData(drawingPaths: any[], metadata?: {
    prompt?: string;
    entry_type?: string;
    skill_category?: string;
    map_area?: string;
    difficulty?: string;
  }): Promise<{ file_url: string; file_id: string }> {
    try {
      console.log('=== UPLOADING DRAWING DATA ===');
      console.log('Drawing paths:', drawingPaths);
      console.log('Metadata:', metadata);

      // For now, we'll save drawings as JSON strings since file upload is complex
      // The drawing data will be saved directly in the codex entry content
      console.log('Saving drawing as JSON string in codex entry');
      throw new Error('Drawing upload not implemented, saving as JSON string');
    } catch (error: any) {
      console.error('Failed to upload drawing data:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Convert local file URI to base64 for web compatibility
   */
  async fileToBase64(fileUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
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
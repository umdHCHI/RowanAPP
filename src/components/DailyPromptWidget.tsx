import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useMasterState } from '../context/MasterStateContext';
import { apiService } from '../services/apiService';
import { createGlobalStyles } from '../styles/globalStyles';
import { DailyPromptResponse, JournalPrompt } from '../types';

interface DailyPromptWidgetProps {
  onPromptSelect?: (prompt: JournalPrompt) => void;
}

const DailyPromptWidget: React.FC<DailyPromptWidgetProps> = ({ onPromptSelect }) => {
  const { theme } = useMasterState();
  const globalStyles = createGlobalStyles(theme.theme);
  
  const [dailyPrompt, setDailyPrompt] = useState<DailyPromptResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDailyPrompt = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDailyPrompt();
      setDailyPrompt(response);
    } catch (error) {
      console.error('Failed to load daily prompt:', error);
      Alert.alert('Error', 'Failed to load daily prompt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyPrompt();
  }, []);

  const handlePromptPress = () => {
    if (dailyPrompt?.prompt && onPromptSelect) {
      onPromptSelect(dailyPrompt.prompt);
    }
  };

  const getStatusMessage = () => {
    if (!dailyPrompt) return 'Loading...';
    
    switch (dailyPrompt.status) {
      case 'assigned':
        return 'Today\'s prompt is ready!';
      case 'newly_assigned':
        return 'New prompt assigned for today!';
      case 'completed':
        return 'Today\'s prompt completed ✓';
      case 'unavailable':
        return 'No prompt available today';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    if (!dailyPrompt) return '#666';
    
    switch (dailyPrompt.status) {
      case 'assigned':
      case 'newly_assigned':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'unavailable':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  return (
    <View style={{
      backgroundColor: theme.theme.archiveMode === 'dark' ? '#2C1810' : '#F5F1E8',
      padding: 16,
      borderRadius: 8,
      margin: 8,
      borderWidth: 1,
      borderColor: theme.theme.archiveMode === 'dark' ? '#8B4513' : '#D2B48C'
    }}>
      <Text style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.theme.archiveMode === 'dark' ? '#F5F1E8' : '#2C1810',
        marginBottom: 8
      }}>
        Daily Prompt
      </Text>
      
      <Text style={{
        fontSize: 14,
        color: getStatusColor(),
        marginBottom: 8,
        fontWeight: '600'
      }}>
        {getStatusMessage()}
      </Text>

      {dailyPrompt?.prompt && (
        <TouchableOpacity 
          onPress={handlePromptPress}
          style={{
            backgroundColor: getStatusColor(),
            padding: 12,
            borderRadius: 6,
            opacity: dailyPrompt.status === 'completed' ? 0.6 : 1
          }}
          disabled={dailyPrompt.status === 'completed'}
        >
          <Text style={{
            color: 'white',
            fontSize: 14,
            textAlign: 'center',
            fontWeight: '600'
          }}>
            {dailyPrompt.status === 'completed' 
              ? 'Completed Today' 
              : 'Start Today\'s Entry'
            }
          </Text>
        </TouchableOpacity>
      )}

      {dailyPrompt?.message && (
        <Text style={{
          fontSize: 12,
          color: theme.theme.archiveMode === 'dark' ? '#CCC' : '#666',
          marginTop: 8,
          fontStyle: 'italic'
        }}>
          {dailyPrompt.message}
        </Text>
      )}

      {loading && (
        <Text style={{
          fontSize: 14,
          color: '#666',
          textAlign: 'center',
          marginTop: 8
        }}>
          Loading daily prompt...
        </Text>
      )}
    </View>
  );
};

export default DailyPromptWidget;

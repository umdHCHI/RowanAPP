import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { PersonalityConfigs } from '../../constants/personality';
import { PersonalityKey } from '../../imports';
import { apiService } from '../../services/apiService';
import { CodexEntry } from '../../types/journal';

interface CodexContentProps {
  onClose: () => void;
  onSave: (entry: any) => void;
  onCreateEntry: () => void;
  unlockedAreas: string[];
  primaryTrait: PersonalityKey;
}

export interface CodexContentRef {
  refreshEntries: () => Promise<void>;
}

export const CodexContent = forwardRef<CodexContentRef, CodexContentProps>(({
  onClose,
  onSave,
  onCreateEntry,
  unlockedAreas,
  primaryTrait
}, ref) => {
  const [entries, setEntries] = useState<CodexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<CodexEntry | null>(null);

  useEffect(() => {
    loadUserEntries();
  }, []);

  // Expose refresh method through ref
  useImperativeHandle(ref, () => ({
    refreshEntries: loadUserEntries
  }));

  const loadUserEntries = async () => {
    try {
      setLoading(true);
      const userEntries = await apiService.getUserCodexEntries();
      setEntries(userEntries);
    } catch (error) {
      Alert.alert('Error', 'Failed to load your codex entries');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEntryTypeIcon = (entryType: string) => {
    switch (entryType) {
      case 'journal': return '📝';
      case 'draw': return '🎨';
      case 'voice': return '🎤';
      default: return '📄';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4ee6e6';
      case 'Intermediate': return '#d4af37';
      case 'Advanced': return '#ff6b6b';
      default: return '#ccc';
    }
  };

  const getSkillCategoryColor = (category: string) => {
    const colors = ['#4ee6e6', '#d4af37', '#ff6b6b', '#51cf66', '#ffd43b', '#ae8fff'];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#4ee6e6', fontSize: 18 }}>Loading your codex entries...</Text>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#4ee6e6', fontSize: 24, fontWeight: 'bold' }}>📖 The Codex</Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <Text style={{ color: '#4ee6e6', fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ flex: 1, backgroundColor: '#23242b', borderRadius: 12, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#4ee6e6', fontSize: 48, marginBottom: 16 }}>📚</Text>
          <Text style={{ color: '#fff', fontSize: 20, marginBottom: 12, textAlign: 'center' }}>Your Codex is Empty</Text>
          <Text style={{ color: '#ccc', fontSize: 16, textAlign: 'center', lineHeight: 24 }}>
            You haven't completed any journal entries yet.{'\n'}
            Navigate back to the main screen to create your first entry!
          </Text>
          <TouchableOpacity 
            style={{ 
              marginTop: 24, 
              paddingVertical: 12, 
              paddingHorizontal: 24, 
              backgroundColor: '#4ee6e6', 
              borderRadius: 20 
            }}
            onPress={onCreateEntry}
          >
            <Text style={{ color: '#0a0b0f', fontSize: 16, fontWeight: 'bold' }}>Create Your First Entry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: '#4ee6e6', fontSize: 24, fontWeight: 'bold' }}>📖 The Codex</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ 
              marginRight: 12,
              paddingVertical: 8,
              paddingHorizontal: 16,
              backgroundColor: '#4ee6e6',
              borderRadius: 16
            }}
            onPress={onCreateEntry}
          >
            <Text style={{ color: '#0a0b0f', fontSize: 14, fontWeight: '600' }}>New Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <Text style={{ color: '#4ee6e6', fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={{ flex: 1, backgroundColor: '#23242b', borderRadius: 12, padding: 20 }}>
        <Text style={{ color: '#fff', fontSize: 18, marginBottom: 16 }}>Your Completed Entries</Text>
        <Text style={{ color: '#ccc', fontSize: 14, lineHeight: 20, marginBottom: 20 }}>
          Explore your {PersonalityConfigs[primaryTrait]?.archiveSection || 'Archive'} journey through {entries.length} completed quests.
        </Text>
        
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {entries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={{
                backgroundColor: '#2a2d35',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: getSkillCategoryColor(entry.skill_category || ''),
              }}
              onPress={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>{getEntryTypeIcon(entry.entry_type)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                      {entry.prompt_text || 'Journal Entry'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ color: '#4ee6e6', fontSize: 12, fontWeight: '600', marginRight: 8 }}>
                        {entry.skill_category}
                      </Text>
                      <View style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: getDifficultyColor(entry.difficulty || ''),
                      }}>
                        <Text style={{
                          color: '#0a0b0f',
                          fontSize: 10,
                          fontWeight: '600'
                        }}>
                          {entry.difficulty}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}>
                  <Ionicons 
                    name={selectedEntry?.id === entry.id ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color="#4ee6e6" 
                  />
                </TouchableOpacity>
              </View>
              
              {selectedEntry?.id === entry.id && (
                <View style={{ 
                  borderTopWidth: 1, 
                  borderTopColor: '#3a3d45', 
                  paddingTop: 12, 
                  marginTop: 8 
                }}>
                  <Text style={{ color: '#ccc', fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                    {entry.content}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#888', fontSize: 12, marginRight: 16 }}>
                        📅 {formatDate(entry.created_at || '')}
                      </Text>
                      {entry.word_count && (
                        <Text style={{ color: '#888', fontSize: 12, marginRight: 16 }}>
                          📊 {entry.word_count} words
                        </Text>
                      )}
                      {entry.duration_seconds && (
                        <Text style={{ color: '#888', fontSize: 12 }}>
                          ⏱️ {Math.round(entry.duration_seconds / 60)}m
                        </Text>
                      )}
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#888', fontSize: 12, marginRight: 8 }}>
                        Updated: {formatDate(entry.updated_at || '')}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={{ 
          marginTop: 16, 
          paddingTop: 16, 
          borderTopWidth: 1, 
          borderTopColor: '#3a3d45' 
        }}>
          <Text style={{ color: '#888', fontSize: 12, textAlign: 'center', fontStyle: 'italic' }}>
            {entries.length} entry{entries.length !== 1 ? 's' : ''} completed • 
            Tap any entry to expand and read your thoughts
          </Text>
          <Text style={{ color: '#666', fontSize: 11, textAlign: 'center', marginTop: 8 }}>
            💡 To create new entries, go back to the main screen
          </Text>
        </View>
      </View>
    </View>
  );
});

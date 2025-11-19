import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { AccessibilityInfo, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PersonalityConfigs } from '../../constants/personality';
import { PersonalityKey } from '../../imports';
import { apiService } from '../../services/apiService';
import { CodexEntry } from '../../types/journal';
import RuneBackground from '../../ui/RuneBackground';
import AudioPlayer from '../shared/AudioPlayer'; // You need to create this
import DrawingViewer from '../shared/DrawingViewer'; // You need to create this

interface CodexContentProps {
  onClose: () => void;
  onSave: (entry: any) => void;
  onCreateEntry: () => void;
  onEditEntry?: (entry: any) => void;
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
  onEditEntry,
  unlockedAreas,
  primaryTrait
}, ref) => {
  const [entries, setEntries] = useState<CodexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<CodexEntry | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Get personality config for theming
  const config = PersonalityConfigs[primaryTrait];
  const palette = {
    primary: config?.theme?.primary || '#4ee6e6',
    secondary: config?.theme?.secondary || '#ccc',
    accent: config?.theme?.accent || '#ffd43b',
  };

  useEffect(() => {
    loadUserEntries();
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      setReducedMotion(enabled);
    });
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
      year: 'numeric'
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <RuneBackground palette={palette} reducedMotion={reducedMotion} />
        <Text style={styles.loadingIcon}>📖</Text>
        <Text style={[styles.loadingText, { color: `${palette.primary}90` }]}>Loading your codex...</Text>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.container}>
        <RuneBackground palette={palette} reducedMotion={reducedMotion} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: '#d0d8e0' }]}>The Codex</Text>
          <View style={[styles.entryCountBadge, { backgroundColor: `${palette.primary}20`, borderColor: `${palette.primary}60` }]}>
            <Text style={[styles.entryCount, { color: `${palette.primary}` }]}>0</Text>
          </View>
        </View>

        {/* Empty State */}
        <View style={[styles.emptyCard, { borderColor: `${palette.primary}30` }]}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>Your Codex Awaits</Text>
          <Text style={styles.emptyText}>
            The pages are blank, waiting for your first inscription.{'\n'}
            Begin recording your journey through The Archive.
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: `${palette.primary}`, borderColor: `${palette.primary}` }]}
            onPress={onCreateEntry}
          >
            <Text style={styles.createButtonText}>Inscribe First Entry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RuneBackground palette={palette} reducedMotion={reducedMotion} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: '#d0d8e0' }]}>The Codex</Text>
        <View style={[styles.entryCountBadge, { backgroundColor: `${palette.primary}20`, borderColor: `${palette.primary}60` }]}>
          <Text style={[styles.entryCount, { color: `${palette.primary}` }]}>
            {entries.length}
          </Text>
        </View>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Inscribed Chronicles
      </Text>

      {/* New Entry Button */}
      <TouchableOpacity
        style={[styles.newEntryButton, {
          backgroundColor: `${palette.primary}15`,
          borderColor: `${palette.primary}60`
        }]}
        onPress={onCreateEntry}
      >
        <Ionicons name="add-circle-outline" size={18} color={`${palette.primary}`} />
        <Text style={[styles.newEntryText, { color: `${palette.primary}` }]}>New Entry</Text>
      </TouchableOpacity>

      {/* Entries List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {entries.map((entry, index) => {
          const isExpanded = selectedEntry?.id === entry.id;

          return (
            <TouchableOpacity
              key={entry.id}
              style={[
                styles.entryCard,
                {
                  backgroundColor: '#0a0e14',
                  borderColor: `${palette.primary}40`,
                  marginBottom: index < entries.length - 1 ? 12 : 0,
                }
              ]}
              onPress={() => setSelectedEntry(isExpanded ? null : entry)}
            >
              {/* Entry Header with Corner Ornament */}
              <View style={styles.entryHeader}>
                <View style={[styles.cornerOrnament, { borderColor: `${palette.primary}60` }]} />

                <View style={styles.entryHeaderContent}>
                  <View style={styles.entryTitleRow}>
                    <View style={[styles.entryMarker, {
                      backgroundColor: `${palette.primary}20`,
                      borderColor: `${palette.primary}60`
                    }]}>
                      <Text style={styles.entryTypeIcon}>{getEntryTypeIcon(entry.entry_type)}</Text>
                    </View>

                    <View style={styles.entryTitleSection}>
                      <Text style={styles.entryTitle} numberOfLines={isExpanded ? undefined : 2}>
                        {entry.prompt_text || 'Journal Entry'}
                      </Text>
                      <View style={styles.entryMetaRow}>
                        {entry.skill_category && (
                          <Text style={[styles.entryCategory, { color: `${palette.accent}90` }]}>
                            {entry.skill_category}
                          </Text>
                        )}
                        {entry.difficulty && (
                          <View style={[styles.difficultyBadge, {
                            backgroundColor: `${palette.secondary}20`,
                            borderColor: `${palette.secondary}60`
                          }]}>
                            <Text style={styles.difficultyText}>{entry.difficulty}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={`${palette.primary}80`}
                      style={styles.expandIcon}
                    />
                  </View>
                </View>
              </View>

              {/* Expanded Content */}
              {isExpanded && (
                <View style={[styles.expandedContent, { borderTopColor: `${palette.primary}20` }]}>
                  {/* Render content based on entry type */}
                  {entry.entry_type === 'draw' ? (
                    <View style={{ marginBottom: 12 }}>
                      <DrawingViewer drawingData={entry.content} />
                    </View>
                  ) : entry.entry_type === 'voice' ? (
                    <View style={{ marginBottom: 12 }}>
                      <AudioPlayer audioUrl={entry.content} />
                    </View>
                  ) : (
                    <Text style={styles.entryContent}>
                      {entry.content || '(No content)'}
                    </Text>
                  )}

                  {/* Entry Stats */}
                  <View style={styles.entryStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statIcon}>📅</Text>
                      <Text style={styles.statText}>{formatDate(entry.created_at || '')}</Text>
                    </View>
                    {entry.word_count && entry.word_count > 0 && (
                      <View style={styles.statItem}>
                        <Text style={styles.statIcon}>📊</Text>
                        <Text style={styles.statText}>{entry.word_count} words</Text>
                      </View>
                    )}
                    {entry.duration_seconds && entry.duration_seconds > 0 && (
                      <View style={styles.statItem}>
                        <Text style={styles.statIcon}>⏱️</Text>
                        <Text style={styles.statText}>{Math.round(entry.duration_seconds / 60)}m</Text>
                      </View>
                    )}
                  </View>
                  {/* Edit Button - Only show for journal entries for now */}
                  {entry.entry_type === 'journal' && onEditEntry && (
                    <TouchableOpacity
                      style={{
                        marginTop: 10,
                        alignSelf: 'flex-end',
                        backgroundColor: palette.primary,
                        borderRadius: 6,
                        paddingVertical: 6,
                        paddingHorizontal: 16,
                      }}
                      onPress={() => {
                        // Signal to parent to open CodexModal in edit mode
                        onEditEntry(entry);
                      }}
                    >
                      <Text style={{ color: '#0a0b0f', fontWeight: 'bold' }}>Edit Entry</Text>
                    </TouchableOpacity>
                  )}

                  {/* View-only message for non-text entries */}
                  {(entry.entry_type === 'draw' || entry.entry_type === 'voice') && (
                    <View style={{
                      marginTop: 10,
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      backgroundColor: `${palette.secondary}20`,
                      borderRadius: 6,
                      alignSelf: 'flex-start',
                    }}>
                      <Text style={{ color: `${palette.secondary}`, fontSize: 12, fontStyle: 'italic' }}>
                        {entry.entry_type === 'draw' ? '🎨 Drawing entries are view-only' : '🎤 Voice entries are view-only'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: `${palette.primary}20` }]}>
        <Text style={styles.footerText}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} preserved
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  entryCountBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  entryCount: {
    fontSize: 11,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    color: '#8fa3b8',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  newEntryText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  entryCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    position: 'relative',
  },
  entryHeader: {
    position: 'relative',
  },
  cornerOrnament: {
    position: 'absolute',
    top: -12,
    left: -12,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 8,
  },
  entryHeaderContent: {
    paddingLeft: 4,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  entryMarker: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  entryTypeIcon: {
    fontSize: 16,
  },
  entryTitleSection: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    color: '#c8d0d8',
    marginBottom: 4,
  },
  entryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryCategory: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9aa8b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expandIcon: {
    marginLeft: 4,
    marginTop: 6,
  },
  expandedContent: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  entryContent: {
    fontSize: 13,
    lineHeight: 19,
    color: '#9aa8b8',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  entryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 12,
  },
  statText: {
    fontSize: 11,
    color: '#6a7a8a',
    fontWeight: '600',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 11,
    color: '#6a7a8a',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050810',
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#d0d8e0',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    color: '#7a8a9a',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  createButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

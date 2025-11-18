import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useMasterState } from "../../context/MasterStateContext";
import { apiService } from '../../services/apiService';
import fileUploadService from '../../services/fileUploadService';
import { createGlobalStyles } from "../../styles/globalStyles";
import { CodexModalProps, JournalPrompt } from "../../types";
import { calculateJournalRewards } from '../../utils/rewardsUtils';
import FloatingRewardNotification from './../rewards/FloatingRewardNotification';
import DrawingCanvas from "./DrawingCanvas";
import VoiceMemoRecorder from './VoiceMemoRecorder';
const { width, height } = Dimensions.get("window");
const isMobile = width < 600;
const CodexModal = ({
  visible,
  onClose,
  onSave,
  isFullScreen = false,
  selectedType = 'journal',
  editingEntry,
}: CodexModalProps & { isFullScreen?: boolean; editingEntry?: any }) => {
  const { wellness, archive, theme, character, auth } = useMasterState();
  const globalStyles = createGlobalStyles(theme.theme);

  const [selectedTypeState, setSelectedTypeState] = useState<
    "journal" | "draw" | "voice"
  >(selectedType);
  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | null>(null);
  const [journalText, setJournalText] = useState("");
  const [drawingPaths, setDrawingPaths] = useState<any[]>([]);
  const [voiceUri, setVoiceUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [completedPrompts, setCompletedPrompts] = useState<string[]>([]);
  const [showCompletedEntries, setShowCompletedEntries] = useState(false);
  const [completedEntries, setCompletedEntries] = useState<any[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rewardNotification, setRewardNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'experience' | 'item' | 'skill' | 'stat' | 'artifact';
    icon?: string;
    iconImage?: any;
    statName?: string;
  }>({
    visible: false,
    message: '',
    type: 'stat'
  });
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    setSelectedTypeState(selectedType);
  }, [selectedType]);

  // Load editing entry data when modal opens in edit mode
  useEffect(() => {
    if (visible && editingEntry) {
      setSelectedTypeState(editingEntry.entry_type || editingEntry.type || 'journal');
      setpassages(editingEntry.content || '');

      // If there's a prompt associated, try to set it
      if (editingEntry.prompt_text) {
        const matchingPrompt = wellness.categoryPrompts[editingEntry.entry_type || 'journal'];
        if (matchingPrompt) {
          setSelectedPrompt(matchingPrompt);
        } else {
          // Create a temporary prompt object from the entry data
          setSelectedPrompt({
            id: editingEntry.prompt || 0,
            prompt_id: editingEntry.prompt_id || '',
            text: editingEntry.prompt_text,
            category: editingEntry.entry_type || 'journal',
            skill_category: editingEntry.skill_category || 'General',
            map_area: editingEntry.mapArea || 'entrance',
            difficulty: editingEntry.difficulty || 'Beginner',
            is_active: false,
            requires_story: null,
            unlocked_after_entries: 0,
            created_at: editingEntry.created_at || '',
            updated_at: editingEntry.updated_at || '',
          } as JournalPrompt);
        }
      }
    } else if (visible && !editingEntry) {
      // Reset form when opening for new entry
      setpassages('');
      setDrawingPaths([]);
    }
  }, [visible, editingEntry]);

  useEffect(() => {
    if (visible) {
      setLoading(true);

      const loadPrompts = async () => {
        try {
          const areas: string[] = [];
          const completed = Array.from(archive.completedStories ?? []);
          await wellness.loadCategoryPrompts(areas, completed);
        } catch (error) {
          console.error('Error loading prompts:', error);
        } finally {
          setLoading(false);
        }
      };

      loadPrompts();
    }
  }, [visible]);

  // Removed this useEffect as it causes infinite re-renders
  // wellness.refreshPrompts is called in the loadPrompts useEffect above

  const refreshAfterSave = async () => {
    const loadPrompts = async () => {
      const characterId = character.backendCharacter?.id;

      try {
        await apiService.getAvailableJournalPrompts(characterId);
      } catch {
        const areas: string[] = [];
        const completed = Array.from(archive.completedStories ?? []);
        await wellness.loadCategoryPrompts(areas, completed);
      }
    };

    await loadCompletedEntries();
    await loadPrompts();

    if (wellness.loadHomeData) {
      await wellness.loadHomeData();
    }
  };

  const loadCompletedEntries = async () => {
    try {
      setEntriesLoading(true);
      const userEntries = await apiService.getUserCodexEntries();
      setCompletedEntries(userEntries);
    } catch (error) {
      console.error('Error loading completed entries:', error);
    } finally {
      setEntriesLoading(false);
    }
  };

  const toggleCompletedEntries = () => {
    if (!showCompletedEntries && completedEntries.length === 0) {
      loadCompletedEntries();
    }
    setShowCompletedEntries(!showCompletedEntries);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4ee6e6';
      case 'Intermediate': return '#d4af37';
      case 'Advanced': return '#ff6b6b';
      default: return '#ccc';
    }
  };

  const getSkillCategoryColor = (category: string) => {
    if (!category) return '#888';
    const colors = ['#4ee6e6', '#d4af37', '#ff6b6b', '#51cf66', '#ffd43b', '#ae8fff'];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const hasContent = selectedTypeState === 'journal'
    ? journalText && journalText.trim().length > 0
    : selectedTypeState === 'draw'
    ? drawingPaths && drawingPaths.length > 0
    : selectedTypeState === 'voice'
    ? voiceUri && voiceUri.length > 0
    : false;

  const handleSave = async () => {
    if (selectedPrompt && hasContent) {
      try {
        const isEditing = !!editingEntry;
        let contentToSave = passages;
        let entryType = selectedTypeState;

        // Handle voice recording upload
        if (selectedTypeState === 'voice' && voiceUri) {
          try {
            const uploadResult = await fileUploadService.uploadAudioFile(voiceUri, {
              prompt: selectedPrompt.text,
              entry_type: selectedTypeState,
              skill_category: selectedPrompt.skill_category,
              map_area: selectedPrompt.map_area,
              difficulty: selectedPrompt.difficulty,
            });
            contentToSave = uploadResult.file_url;
          } catch {
            contentToSave = passages;
          }
        }
        
        // Handle drawing upload
        if (selectedTypeState === 'draw' && drawingPaths.length > 0) {
          try {
            const uploadResult = await fileUploadService.uploadDrawingData(drawingPaths, {
              prompt: selectedPrompt.text,
              entry_type: selectedTypeState,
              skill_category: selectedPrompt.skill_category,
              map_area: selectedPrompt.map_area,
              difficulty: selectedPrompt.difficulty,
            });
            // If it's a local fallback, store the actual drawing data as JSON
            if (uploadResult.file_url.startsWith('local://')) {
              contentToSave = JSON.stringify(drawingPaths);
            } else {
              contentToSave = uploadResult.file_url;
            }
          } catch {
            contentToSave = JSON.stringify(drawingPaths);
          }
        }

        try {
          let saveResult;

          if (isEditing && editingEntry.id) {
            // Update existing entry
            saveResult = await apiService.updateCodexEntry(editingEntry.id, {
              content: contentToSave,
              entry_type: selectedTypeState
            });
          } else {
            // Check if entry already exists for this prompt
            const existingEntries = await apiService.getCodexEntriesByPrompt(selectedPrompt.id);

            if (existingEntries.length > 0) {
              saveResult = await apiService.updateCodexEntry((existingEntries[0] as any).id, {
                content: contentToSave,
                entry_type: selectedTypeState
              });
            } else {
              saveResult = await wellness.quickJournalEntry(selectedPrompt.id, contentToSave, selectedTypeState);
            }
          }

          try {
            // Only give rewards for new entries, not edits
            if (!isEditing) {
              const journalReward = calculateJournalRewards(
                selectedTypeState,
                selectedPrompt.skill_category,
                selectedPrompt.difficulty
              );

              if (journalReward.experience > 0) {
                await character.gainExperience(journalReward.experience, `journal_${selectedTypeState}`);
              }

              if (Object.keys(journalReward.wellnessStats).length > 0) {
                const idFromContext = character.backendCharacter?.id ?? character.userProfileData?.character?.id;
                if (!idFromContext) throw new Error('No character id to award wellness');

                await apiService.gainWellness(idFromContext, journalReward.wellnessStats);

                try {
                  await wellness.loadHomeData?.();
                } catch {
                }
              }

              let rewardMessage = journalReward.message;
              if (journalReward.experience > 0) {
                rewardMessage += ` +${journalReward.experience} XP`;
              }

              const wellnessGainText = Object.entries(journalReward.wellnessStats)
                .map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)} +${value}`)
                .join(', ');

              if (wellnessGainText) {
                rewardMessage += ` | ${wellnessGainText}`;
              }

              setRewardNotification({
                visible: true,
                message: rewardMessage,
                type: 'experience',
                icon: '⭐'
              });
            } else {
              // For edits, just show a success message
              Alert.alert(
                "Entry Updated",
                "Your journal entry has been successfully updated.",
                [{ text: "OK" }]
              );
            }
          } catch {
            Alert.alert(
              isEditing ? "Entry Updated" : "Entry Saved",
              isEditing
                ? "Your journal entry has been updated."
                : "Your journal entry has been saved, but there was an issue applying rewards.",
              [{ text: "OK" }]
            );
          }
        } catch (backendError: any) {
          const data = backendError?.response?.data;
          const isUniqueError = Array.isArray(data?.non_field_errors) &&
            data.non_field_errors.join(' ').toLowerCase().includes('unique');
          
          if (isUniqueError) {
            try {
              const existingEntries = await apiService.getCodexEntriesByPrompt(selectedPrompt.id);
              if (existingEntries.length > 0) {
                await apiService.updateCodexEntry((existingEntries[0] as any).id, {
                  content: contentToSave,
                  entry_type: selectedTypeState
                });
              } else {
                throw new Error('No existing entry found to update');
              }
            } catch {
              Alert.alert(
                "Backend Error",
                "Failed to save to backend, but entry will be saved locally.",
                [{ text: "OK" }]
              );
            }
          } else {
            Alert.alert(
              "Backend Error",
              "Failed to save to backend, but entry will be saved locally.",
              [{ text: "OK" }]
            );
          }
        }

        try {
          // Only mark prompt as inactive for new entries, not edits
          if (!isEditing && selectedPrompt?.id) {
            await wellness.markPromptInactive(selectedPrompt.id);
          }
        } catch {
        }

        onSave({
          type: selectedTypeState,
          passages: contentToSave,
          prompt: selectedPrompt.text,
          skillCategory: selectedPrompt.skill_category,
          mapArea: selectedPrompt.map_area,
          difficulty: selectedPrompt.difficulty,
        });

        const completedStoriesArray = Array.from(archive.completedStories);
        const areas: string[] = [];
        await wellness.loadCategoryPrompts(areas, completedStoriesArray);

        await loadCompletedEntries();

        setJournalText("");
        setDrawingPaths([]);
        setVoiceUri("");
        setSelectedPrompt(null);
        setCompletedPrompts((prev) => [...prev, selectedPrompt.prompt_id]);
        onClose();
      } catch (error) {
        Alert.alert(
          "Error",
          "There was an error saving your entry. Please try again.",
          [{ text: "OK" }]
        );
      }
    }
  };

  const currentPrompt = wellness.categoryPrompts[selectedTypeState];
  const hasPromptForCategory = currentPrompt !== null;

  // Only update selectedPrompt when selectedTypeState changes or when modal opens
  useEffect(() => {
    setSelectedPrompt(wellness.categoryPrompts[selectedTypeState]);
  }, [selectedTypeState, visible, wellness.categoryPrompts]);

  return (
    <>
      <Modal
        visible={visible}
        animationType={isFullScreen ? "none" : "slide"}
        transparent={!isMobile && !isFullScreen}
        onRequestClose={onClose}
      >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={isFullScreen ? { flex: 1, backgroundColor: '#0a0b0f' } : (isMobile ? { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' } : globalStyles.codexModalOverlay)}>
            <View style={isFullScreen ? { flex: 1, margin: 0, borderRadius: 0, justifyContent: 'flex-start' } : (isMobile ? { flex: 1, margin: 0, borderRadius: 0, justifyContent: 'flex-start', maxHeight: height - 40 } : globalStyles.codexModalpassages)}>
              <View style={[
                isMobile ? { flex: 1, padding: 0 } : globalStyles.codexPixelBorder,
              ]}>

              <View style={[
                isMobile ? { flex: 1, padding: 0 } : globalStyles.codexInnerpassages,
              ]}>
              <View
                style={[
                  globalStyles.codexHeader,
                  { borderBottomColor: '#d4af37' },
                  isMobile && { paddingTop: 40, paddingHorizontal: 12, paddingBottom: 12 },
                ]}
              >
                <Text
                  style={[
                    globalStyles.codexTitle,
                    { 
                      color: '#4ee6e6',
                      fontSize: isMobile ? 22 : 28,
                      fontWeight: 'bold',
                      letterSpacing: isMobile ? 2 : 3,
                      textShadowColor: 'rgba(78, 230, 230, 0.5)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 8,
                      flex: 1,
                    },
                  ]}
                >
                  📖 The Codex
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={globalStyles.codexCloseButton}
                >
                  <Ionicons name="close" size={24} color="#4ee6e6" />
                </TouchableOpacity>
              </View>

              <View style={[
                globalStyles.codexTypeSelector,
                isMobile && { paddingHorizontal: 12, paddingVertical: 12, gap: 10 }
              ]}>
                <TouchableOpacity
                  style={[
                    globalStyles.codexTypeButton,
                    isMobile && { paddingVertical: 10, paddingHorizontal: 16 },
                    selectedTypeState === "journal" && {
                      backgroundColor: 'rgba(78, 230, 230, 0.2)',
                      borderColor: '#4ee6e6',
                      borderWidth: 2,
                      shadowColor: '#4ee6e6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      elevation: 8,
                    },
                  ]}
                  onPress={() => setSelectedTypeState("journal")}
                >
                  <Text
                    style={[
                      globalStyles.codexTypeText,
                      { 
                        color: selectedTypeState === "journal" ? '#4ee6e6' : '#d4af37',
                        fontWeight: selectedTypeState === "journal" ? 'bold' : '600',
                        textShadowColor: selectedTypeState === "journal" ? 'rgba(78, 230, 230, 0.5)' : 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 2 },
                        textShadowRadius: 4,
                      },
                    ]}
                  >
                    📝 Journal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    globalStyles.codexTypeButton,
                    isMobile && { paddingVertical: 10, paddingHorizontal: 16 },
                    selectedTypeState === "draw" && {
                      backgroundColor: 'rgba(78, 230, 230, 0.2)',
                      borderColor: '#4ee6e6',
                      borderWidth: 2,
                      shadowColor: '#4ee6e6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      elevation: 8,
                    },
                  ]}
                  onPress={() => setSelectedTypeState("draw")}
                >
                  <Text
                    style={[
                      globalStyles.codexTypeText,
                      { 
                        color: selectedTypeState === "draw" ? '#4ee6e6' : '#d4af37',
                        fontWeight: selectedTypeState === "draw" ? 'bold' : '600',
                        textShadowColor: selectedTypeState === "draw" ? 'rgba(78, 230, 230, 0.5)' : 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 2 },
                        textShadowRadius: 4,
                      },
                    ]}
                  >
                    🎨 Draw
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    globalStyles.codexTypeButton,
                    isMobile && { paddingVertical: 10, paddingHorizontal: 16 },
                    selectedTypeState === "voice" && {
                      backgroundColor: 'rgba(78, 230, 230, 0.2)',
                      borderColor: '#4ee6e6',
                      borderWidth: 2,
                      shadowColor: '#4ee6e6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      elevation: 8,
                    },
                  ]}
                  onPress={() => setSelectedTypeState("voice")}
                >
                  <Text
                    style={[
                      globalStyles.codexTypeText,
                      { 
                        color: selectedTypeState === "voice" ? '#4ee6e6' : '#d4af37',
                        fontWeight: selectedTypeState === "voice" ? 'bold' : '600',
                        textShadowColor: selectedTypeState === "voice" ? 'rgba(78, 230, 230, 0.5)' : 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 2 },
                        textShadowRadius: 4,
                      },
                    ]}
                  >
                    🎤 Voice
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
              <ScrollView
                style={isMobile ? { flex: 1 } : { flex: 1 }}
                contentContainerStyle={isMobile ? { flexGrow: 1 } : {}}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                scrollEnabled={!isDrawing}
                scrollEnabled={!isDrawing}
              >
                <View style={isMobile ? { flexDirection: 'column', minHeight: 0 } : globalStyles.codexpassagesContainer}>
                  {/* Your Quest Section - Always visible on mobile */}
                  <View style={isMobile ? { 
                    padding: 12, 
                    paddingBottom: 8
                  } : globalStyles.codexPromptSection}>
                    <Text
                      style={[
                        globalStyles.codexSectionTitle,
                        { 
                          color: '#4ee6e6',
                          fontSize: 20,
                          fontWeight: 'bold',
                          letterSpacing: 2,
                          textShadowColor: 'rgba(78, 230, 230, 0.5)',
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 4,
                        },
                        isMobile && { fontSize: 18, marginBottom: 4 }
                      ]}
                    >
                      Your Quest
                    </Text>
                  <View style={[
                    globalStyles.codexPromptList,
                    isMobile && { flexShrink: 0 }
                  ]}>
                    {hasPromptForCategory ? (
                      <TouchableOpacity
                        style={[
                          globalStyles.codexPromptItem,
                          globalStyles.codexSelectedPrompt,
                          isMobile && { padding: 8, marginBottom: 4 },
                          {
                            borderColor: '#d4af37',
                            borderWidth: 2,
                            shadowColor: '#d4af37',
                            shadowOffset: { width: 2, height: 6 },
                            shadowOpacity: 0.4,
                            shadowRadius: 12,
                            elevation: 12,

                          }
                        ]}
                        onPress={() => setSelectedPrompt(currentPrompt)}
                      >
                        <Text
                          style={[
                            globalStyles.codexPromptText,
                            { 
                              color: '#ffe066',
                              fontSize: 14,
                              fontWeight: '600',
                              lineHeight: 20,
                            },
                            isMobile && { fontSize: 14, lineHeight: 18 }
                          ]}
                        >
                          {currentPrompt?.text}
                        </Text>
                        <View style={globalStyles.codexPromptMeta}>
                          <Text
                            style={[
                              globalStyles.codexSkillCategory,
                              { 
                                color: '#4ee6e6',
                                fontSize: 12,
                                fontWeight: 'bold',
                                textShadowColor: 'rgba(78, 230, 230, 0.3)',
                                textShadowOffset: { width: 0, height: 1 },
                                textShadowRadius: 2,
                              },
                              isMobile && { fontSize: 12 }
                            ]}
                          >
                            {currentPrompt?.skill_category}
                          </Text>
                          <Text
                            style={[
                              globalStyles.codexDifficulty,
                              { 
                                color: '#d4af37',
                                fontSize: 12,
                                fontStyle: 'italic',
                                fontWeight: '600',
                              },
                              isMobile && { fontSize: 12 }
                            ]}
                          >
                            {currentPrompt?.difficulty}
                          </Text>
                        </View>
                        {/* Hide difficulty badges on mobile to save space */}
                        {!isMobile && (
                          <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: '#d4af37', fontSize: 10, marginRight: 8, fontStyle: 'italic' }}>
                              Available difficulties:
                            </Text>
                            {['Beginner', 'Intermediate', 'Advanced'].map((difficulty) => {
                              const isAvailable = archive.completedStories.size >= 
                                (difficulty === 'Beginner' ? 0 : 
                                 difficulty === 'Intermediate' ? 3 : 6);
                              return (
                                <View
                                  key={difficulty}
                                  style={{
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    marginRight: 4,
                                    borderRadius: 4,
                                    backgroundColor: isAvailable 
                                      ? '#4ee6e6' 
                                      : 'rgba(255,255,255,0.1)',
                                    opacity: isAvailable ? 1 : 0.3
                                  }}
                                >
                                  <Text style={{
                                    color: isAvailable ? '#0a0b0f' : '#d4af37',
                                    fontSize: 8,
                                    fontWeight: '600'
                                  }}>
                                    {difficulty}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View style={[
                        globalStyles.codexPromptItem,
                        isMobile && { padding: 8, marginBottom: 4 },
                        {
                          borderColor: '#d4af37',
                          borderWidth: 1,
                          shadowColor: '#d4af37',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        }
                      ]}>
                        <Text
                          style={[
                            globalStyles.codexPromptText,
                            { 
                              color: '#d4af37',
                              fontSize: 14,
                              fontStyle: 'italic',
                              lineHeight: 20,
                            },
                            isMobile && { fontSize: 14, lineHeight: 18 }
                          ]}
                        >
                          {loading 
                            ? "Loading your quest..." 
                            : `No ${selectedTypeState} quest available yet. Explore more stories to unlock new prompts!`                          }
                        </Text>
                        {!loading && (
                          <TouchableOpacity
                            style={{
                              marginTop: 12,
                              paddingVertical: 8,
                              paddingHorizontal: 16,
                              backgroundColor: '#4ee6e6',
                              borderRadius: 20,
                              alignSelf: 'flex-start',
                              borderWidth: 2,
                              borderColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }}
                            onPress={() => {
                              const loadPrompts = async () => {
                                setLoading(true);
                                try {
                                  const areas: string[] = [];
                                  const completed = Array.from(archive.completedStories ?? []);
                                  await wellness.loadCategoryPrompts(areas, completed);
                                } catch (error) {
                                  console.error('Error retrying prompt load:', error);
                                } finally {
                                  setLoading(false);
                                }
                              };
                              loadPrompts();
                            }}
                          >
                            <Text style={{ 
                              color: '#0a0b0f', 
                              fontSize: 12, 
                              fontWeight: 'bold',
                              textShadowColor: 'rgba(10, 11, 15, 0.3)',
                              textShadowOffset: { width: 0, height: 1 },
                              textShadowRadius: 2,
                            }}>
                              Retry Loading
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
                {/* Toggle for Completed Entries */}
                <View style={[{ 
                  paddingHorizontal: 12, 
                  paddingTop: 0,
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#3a3d45',
                  marginTop: 0
                },
                isMobile && { paddingHorizontal: 12, paddingBottom: 10 }
                ]}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      backgroundColor: showCompletedEntries ? 'rgba(78, 230, 230, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: showCompletedEntries ? '#4ee6e6' : '#3a3d45',
                    }}
                    onPress={toggleCompletedEntries}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 20, marginRight: 8 }}>
                        {showCompletedEntries ? '📚' : '📖'}
                      </Text>
                      <Text style={{ 
                        color: showCompletedEntries ? '#4ee6e6' : '#ccc',
                        fontSize: 16,
                        fontWeight: '600'
                      }}>
                        {showCompletedEntries ? 'Hide' : 'Show'} Completed Entries
                      </Text>
                    </View>
                    <Ionicons 
                      name={showCompletedEntries ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={showCompletedEntries ? '#4ee6e6' : '#888'} 
                    />
                  </TouchableOpacity>
                  
                  {/* Completed Entries List */}
                  {showCompletedEntries && (
                    <View style={{ }}>
                      <Text style={{ 
                        color: '#4ee6e6', 
                        fontSize: 16, 
                        fontWeight: '600', 
                        marginBottom: 12,
                        textAlign: 'center'
                      }}>
                        Your Completed Quests ({completedEntries.length})
                      </Text>
                      
                      {entriesLoading ? (
                        <View style={{ 
                          padding: 20, 
                          alignItems: 'center',
                          backgroundColor: '#2a2d35',
                          borderRadius: 8
                        }}>
                          <Text style={{ color: '#4ee6e6', fontSize: 14 }}>Loading your entries...</Text>
                        </View>
                      ) : completedEntries.length === 0 ? (
                        <View style={{ 
                          padding: 20, 
                          alignItems: 'center',
                          backgroundColor: '#2a2d35',
                          borderRadius: 8,
                        }}>
                          <Text style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>
                            No completed entries yet. Complete your first quest to see it here!
                          </Text>
                        </View>
                      ) : (
                        <ScrollView 
                          style={isMobile ? { maxHeight: 80 } : { maxHeight: 100 }} 
                          showsVerticalScrollIndicator={false}
                          nestedScrollEnabled={true}
                          keyboardShouldPersistTaps="handled"
                        >
                          {completedEntries.map((entry) => (
                            <View
                              key={entry.id}
                              style={{
                                backgroundColor: '#2a2d35',
                                borderRadius: 8,
                                padding: 12,
                                marginBottom: 8,
                                borderLeftWidth: 3,
                                borderLeftColor: getSkillCategoryColor(entry.skill_category || ''),
                              }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Text style={{ fontSize: 16, marginRight: 8 }}>
                                  {getEntryTypeIcon(entry.entry_type)}
                                </Text>
                                <Text style={{ 
                                  color: '#fff', 
                                  fontSize: 14, 
                                  fontWeight: '600',
                                  flex: 1
                                }}>
                                  {entry.prompt_text || 'Journal Entry'}
                                </Text>
                              </View>
                              
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Text style={{ 
                                  color: '#4ee6e6', 
                                  fontSize: 11, 
                                  fontWeight: '600', 
                                  marginRight: 8 
                                }}>
                                  {entry.skill_category}
                                </Text>
                                <View style={{
                                  paddingHorizontal: 4,
                                  paddingVertical: 1,
                                  borderRadius: 3,
                                  backgroundColor: getDifficultyColor(entry.difficulty || ''),
                                }}>
                                  <Text style={{
                                    color: '#0a0b0f',
                                    fontSize: 9,
                                    fontWeight: '600'
                                  }}>
                                    {entry.difficulty}
                                  </Text>
                                </View>
                              </View>
                              
                              <Text style={{ 
                                color: '#ccc', 
                                fontSize: 12, 
                                lineHeight: 16,
                                marginBottom: 8,
                                fontStyle: 'italic'
                              }}>
                                {entry.content_preview || entry.content?.substring(0, 100) || 'No content preview available'}
                                {entry.content && entry.content.length > 100 ? '...' : ''}
                              </Text>
                              
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: '#888', fontSize: 10 }}>
                                  📅 {formatDate(entry.created_at || '')}
                                </Text>
                                {entry.word_count && (
                                  <Text style={{ color: '#888', fontSize: 10 }}>
                                    📊 {entry.word_count} words
                                  </Text>
                                )}
                              </View>
                            </View>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  )}
                </View>

                {/* Input Section - Takes remaining space on mobile */}
                <View style={[
                  isMobile ? { 
                    flex: 1, 
                    minHeight: 0, 
                    minWidth: 0, 
                    paddingHorizontal: 12,
                    paddingTop: 8
                  } : globalStyles.codexInputSection,
                  { 
                    pointerEvents: 'auto',
                    backgroundColor: 'transparent' // Ensure background doesn't interfere
                  }
                ]}>
                  {selectedTypeState === "journal" && (
                    <View style={{ 
                      flex: 1,
                      minHeight: isMobile ? 400 : 400,
                      backgroundColor: 'rgba(244, 241, 232, 0.98)', // Solid background for text input
                      borderRadius: 8,
                      padding: isMobile ? 12 : 12,
                      borderWidth: 2,
                      borderColor: '#d4af37',
                      shadowColor: '#8b4513',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 5,
                      zIndex: 10, // Ensure it's above parchment
                      position: 'relative',
                    }}>
                      <Text style={{ 
                        color: '#2c1810', 
                        fontSize: 14, 
                        marginBottom: 8,
                        fontWeight: '600' 
                      }}>
                        {selectedPrompt ? `Prompt: ${selectedPrompt.text}` : 'No prompt available - you can still write your thoughts'}
                      </Text>
                      <TextInput
                        style={{
                          flex: 1,
                          color: '#2c1810',
                          backgroundColor: 'transparent',
                          fontSize: 16,
                          textAlignVertical: 'top',
                          padding: 8,
                          zIndex: 11,
                          minHeight: 100,
                        }}
                        multiline
                        placeholder="Write your thoughts here..."
                        placeholderTextColor="#5d4037"
                        value={journalText}
                        onChangeText={setJournalText}
                        autoFocus={false}
                        scrollEnabled={true}
                        returnKeyType="done"
                        blurOnSubmit={true}
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>
                  )}
                  {selectedTypeState === "draw" && (
                    <View style={{ 
                      flex: 1, 
                      minHeight: isMobile ? 400 : 400,
                      backgroundColor: 'rgba(244, 241, 232, 0.98)',
                      borderRadius: 8,
                      padding: isMobile ? 12 : 12,
                      borderWidth: 2,
                      borderColor: '#d4af37',
                      shadowColor: '#8b4513',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 5,
                      zIndex: 10,
                      position: 'relative',
                    }}>
                      <DrawingCanvas
                        hideButtons={true}
                        onDrawingStart={() => setIsDrawing(true)}
                        onDrawingEnd={() => setIsDrawing(false)}
                        onStrokesChange={(paths) => {
                          try {
                            setDrawingPaths(paths);
                          } catch {
                            Alert.alert('Error', 'Failed to save drawing. Please try again.');
                          }
                        }}
                        onSave={(paths) => {
                          // Not used when hideButtons is true
                        }}
                        onCancel={() => {
                          // Not used when hideButtons is true
                        }}
                        onDrawingStart={() => {
                          setIsDrawing(true);
                        }}
                        onDrawingEnd={() => {
                          setIsDrawing(false);
                        }}
                      />
                    </View>
                  )}
                  {selectedTypeState === "voice" && (
                    <View style={{ 
                      flex: 1, 
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: isMobile ? 400 : 400,
                      backgroundColor: 'rgba(244, 241, 232, 0.98)', // Solid background for voice recorder
                      borderRadius: 8,
                      padding: isMobile ? 12 : 12,
                      borderWidth: 2,
                      borderColor: '#d4af37',
                      shadowColor: '#8b4513',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 5,
                      zIndex: 10, // Ensure it's above parchment
                      position: 'relative',
                    }}>
                      <VoiceMemoRecorder
                        onSave={(audioUri) => {
                          setVoiceUri(audioUri);
                        }}
                        theme={theme.theme}
                      />
                    </View>
                  )}
                </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[
                  globalStyles.codexSaveButton,
                  (!selectedPrompt || !hasContent) &&
                    globalStyles.codexDisabledButton,
                  {
                    borderColor: '#4ee6e6',
                    borderWidth: 2,
                    backgroundColor: (!selectedPrompt || !hasContent) 
                      ? 'rgba(78, 230, 230, 0.2)' 
                      : '#4ee6e6',
                    shadowColor: '#4ee6e6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                    borderRadius: 20,
                    paddingVertical: isMobile ? 10 : 12,
                    paddingHorizontal: isMobile ? 20 : 24,
                    marginBottom: isMobile ? 8 : 16,
                  },
                ]}
                onPress={handleSave}
                disabled={!selectedPrompt || !hasContent}
              >
                <Text
                  style={[
                    globalStyles.codexSaveButtonText,
                    { 
                      color: (!selectedPrompt || !hasContent) ? '#d4af37' : '#0a0b0f',
                      fontWeight: 'bold',
                      fontSize: 16,
                      textShadowColor: (!selectedPrompt || !hasContent) ? 'rgba(212, 175, 55, 0.3)' : 'rgba(10, 11, 15, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    },
                  ]}
                >
                  Save to Codex
                </Text>
              </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
    
    <FloatingRewardNotification
      visible={rewardNotification.visible}
      message={rewardNotification.message}
      type={rewardNotification.type}
      icon={rewardNotification.icon}
      iconImage={rewardNotification.iconImage}
      statName={rewardNotification.statName}
      onHide={() => setRewardNotification(prev => ({ ...prev, visible: false }))}
    />
    </>
  );
};

export default CodexModal;

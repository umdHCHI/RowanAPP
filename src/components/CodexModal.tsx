import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useMasterState } from "../context/MasterStateContext";
import fileUploadService from '../services/fileUploadService';
import { createGlobalStyles } from "../styles/globalStyles";
import { CodexModalProps, JournalPrompt } from "../types";
import { calculateJournalRewards } from '../utils/rewardsUtils';
import DrawingCanvas from "./DrawingCanvas";
import FloatingRewardNotification from './FloatingRewardNotification';
import VoiceMemoRecorder from './VoiceMemoRecorder';
const { width, height } = Dimensions.get("window");
const isMobile = width < 600;
const CodexModal = ({
  visible,
  onClose,
  onSave,
  isFullScreen = false,
  selectedType = 'journal',
}: CodexModalProps & { isFullScreen?: boolean }) => {
  const { wellness, archive, theme, character } = useMasterState();
  const globalStyles = createGlobalStyles(theme.theme);

  const parchmentSource =
    theme.theme.archiveMode === "dark"
      ? require("../../assets/textures/journal_page-dark.png")
      : require("../../assets/textures/journal_page-light.png");

  const [selectedTypeState, setSelectedTypeState] = useState<
    "journal" | "draw" | "voice"
  >(selectedType);
  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | null>(null);
  const [passages, setpassages] = useState("");
  const [drawingPaths, setDrawingPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedPrompts, setCompletedPrompts] = useState<string[]>([]);
  const [rewardNotification, setRewardNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'experience' | 'item' | 'skill' | 'stat' | 'artifact';
  }>({
    visible: false,
    message: '',
    type: 'stat'
  });

  // Update selectedTypeState when selectedType prop changes
  useEffect(() => {
    setSelectedTypeState(selectedType);
  }, [selectedType]);

  // Load prompts only when modal becomes visible
  useEffect(() => {
    if (visible) {
      console.log('🔄 CodexModal opened');
      console.log('🔄 Current wellness.categoryPrompts:', wellness.categoryPrompts);
      setLoading(true);
      
      const loadPrompts = async () => {
        try {
          // Always refresh prompts when modal opens to ensure we have the latest
          console.log('🔄 Refreshing prompts for modal...');
          const fallbackAreas = ['journal', 'draw', 'voice'];
          const completedStoriesArray = Array.from(archive.completedStories);
          console.log('🔄 Loading with areas:', fallbackAreas);
          console.log('🔄 Completed stories:', completedStoriesArray);
          await wellness.loadCategoryPrompts(fallbackAreas, completedStoriesArray);
          console.log('✅ Prompts refreshed successfully');
          console.log('✅ Updated wellness.categoryPrompts:', wellness.categoryPrompts);
        } catch (error) {
          console.warn('Error loading prompts (continuing with empty prompts):', error);
          // Continue with empty prompts rather than failing completely
          // Set loading to false so the UI doesn't hang
        } finally {
          setLoading(false);
        }
      };
      
      loadPrompts();
    }
  }, [visible]); // Remove unlockedAreas dependency



  const handleSave = async () => {
    if (selectedPrompt && passages) {
      try {
        console.log('=== SAVING CODEX ENTRY ===');
        console.log('Selected prompt:', selectedPrompt);
        console.log('Content:', passages);
        console.log('Entry type:', selectedTypeState);

        let contentToSave = passages;
        let entryType = selectedTypeState;

        // Handle file uploads for mobile devices
        if (Platform.OS !== 'web') {
          if (selectedTypeState === 'voice' && passages.startsWith('file://')) {
            try {
              console.log('Uploading audio file to backend...');
              const uploadResult = await fileUploadService.uploadAudioFile(passages, {
                prompt: selectedPrompt.text,
                entry_type: selectedTypeState,
                skill_category: selectedPrompt.skill_category,
                map_area: selectedPrompt.map_area,
                difficulty: selectedPrompt.difficulty,
              });
              contentToSave = uploadResult.file_url;
              console.log('✅ Audio file uploaded successfully:', uploadResult);
            } catch (uploadError) {
              console.error('❌ Failed to upload audio file:', uploadError);
              // Fallback: save the local file path
              contentToSave = passages;
              Alert.alert(
                "Upload Error",
                "Failed to upload audio file to backend. The recording will be saved locally.",
                [{ text: "OK" }]
              );
            }
          }
        }
        
        // Handle drawing uploads for both web and mobile
        if (selectedTypeState === 'draw' && drawingPaths.length > 0) {
          try {
            console.log('Uploading drawing data to backend...');
            const uploadResult = await fileUploadService.uploadDrawingData(drawingPaths, {
              prompt: selectedPrompt.text,
              entry_type: selectedTypeState,
              skill_category: selectedPrompt.skill_category,
              map_area: selectedPrompt.map_area,
              difficulty: selectedPrompt.difficulty,
            });
            contentToSave = uploadResult.file_url;
            console.log('✅ Drawing data uploaded successfully:', uploadResult);
          } catch (uploadError) {
            console.error('❌ Failed to upload drawing data:', uploadError);
            // Fallback: save the JSON data directly
            contentToSave = JSON.stringify(drawingPaths);
            Alert.alert(
              "Upload Error",
              "Failed to upload drawing data to backend. The drawing will be saved locally.",
              [{ text: "OK" }]
            );
          }
        }

        // Save to backend first
        try {
          await wellness.createCodexEntry({
            prompt: selectedPrompt.id, // Use the prompt ID (number) instead of text
            entry_type: entryType,
            content: contentToSave,
          });
          console.log('✅ Codex entry saved to backend successfully');
          
          // Calculate and apply rewards
          try {
            // Use the reward utility function for consistent calculation
            const journalReward = calculateJournalRewards(
              selectedTypeState,
              selectedPrompt.skill_category,
              selectedPrompt.difficulty
            );
            
            console.log('🎁 Calculated rewards using utility:', journalReward);
            
            // Apply experience and wellness gains
            if (journalReward.experience > 0) {
              console.log('🎁 Applying experience gain:', journalReward.experience);
              await character.gainExperience(journalReward.experience, `journal_${selectedTypeState}`);
            }
            
            if (Object.keys(journalReward.wellnessStats).length > 0) {
              console.log('🎁 Applying wellness gains:', journalReward.wellnessStats);
              await character.gainWellness(journalReward.wellnessStats);
              console.log('✅ Wellness gains applied to backend');
            }
            
            // Show floating reward notification
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
            
            console.log('🎁 Setting reward notification:', rewardMessage);
            setRewardNotification({
              visible: true,
              message: rewardMessage,
              type: 'experience'
            });
            
            // Add a small delay to ensure the notification is set before modal closes
            setTimeout(() => {
              console.log('🎁 Reward notification should be visible now');
            }, 100);
          } catch (rewardError) {
            console.error('❌ Failed to apply rewards:', rewardError);
            // Still show success message even if rewards fail
            Alert.alert(
              "Entry Saved",
              "Your journal entry has been saved to your Codex.",
              [{ text: "OK" }]
            );
          }
        } catch (backendError) {
          console.error('❌ Failed to save to backend:', backendError);
          Alert.alert(
            "Backend Error",
            "Failed to save to backend, but entry will be saved locally.",
            [{ text: "OK" }]
          );
        }

        // Mark the prompt as inactive (completed)
        try {
          await wellness.markPromptInactive(selectedPrompt.prompt_id);
          console.log(`Marked prompt ${selectedPrompt.prompt_id} as inactive`);
        } catch (deactivateError) {
          console.error('Error marking prompt as inactive:', deactivateError);
          // Continue with save even if deactivation fails
        }

        // Call the original onSave for local state updates
        onSave({
          type: selectedTypeState,
          passages,
          prompt: selectedPrompt.text,
          skillCategory: selectedPrompt.skill_category,
          mapArea: selectedPrompt.map_area,
          difficulty: selectedPrompt.difficulty,
        });

        // Refresh prompts to get a new one (since the current one is now inactive)
        try {
          const completedStoriesArray = Array.from(archive.completedStories);
          const fallbackAreas = ['journal', 'draw', 'voice'];
          await wellness.loadCategoryPrompts(fallbackAreas, completedStoriesArray);
        } catch (refreshError) {
          console.warn('Failed to refresh prompts after saving:', refreshError);
          // Continue even if refresh fails
        }

        // Clear the form
        setpassages("");
        setSelectedPrompt(null);
        setCompletedPrompts((prev) => [...prev, selectedPrompt.prompt_id]);
        onClose();
      } catch (error) {
        console.error("Error saving journal entry:", error);
        Alert.alert(
          "Error",
          "There was an error saving your entry. Please try again.",
          [{ text: "OK" }]
        );
      }
    }
  };
  // Get the current prompt for the selected type from the category prompts
  const currentPrompt = wellness.categoryPrompts[selectedTypeState];
  const hasPromptForCategory = currentPrompt !== null;

  // Set the selected prompt when switching categories or when prompts are loaded
  useEffect(() => {
    if (hasPromptForCategory) {
      setSelectedPrompt(currentPrompt);
    } else {
      setSelectedPrompt(null);
    }
  }, [selectedTypeState, hasPromptForCategory, wellness.categoryPrompts]); // Add wellness.categoryPrompts dependency

  // Ensure selected prompt is set when modal opens and prompts are available
  useEffect(() => {
    if (visible && !selectedPrompt && hasPromptForCategory) {
      setSelectedPrompt(currentPrompt);
    }
  }, [visible, selectedPrompt, hasPromptForCategory, currentPrompt, selectedTypeState]);

  return (
    <>
      <Modal
        visible={visible}
        animationType={isFullScreen ? "none" : "slide"}
        transparent={!isMobile && !isFullScreen}
        onRequestClose={onClose}
      >
      <View style={isFullScreen ? { flex: 1, backgroundColor: '#0a0b0f' } : (isMobile ? { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' } : globalStyles.codexModalOverlay)}>
        <View style={isFullScreen ? { flex: 1, margin: 0, borderRadius: 0, justifyContent: 'flex-start' } : (isMobile ? { flex: 1, margin: 0, borderRadius: 0, justifyContent: 'flex-start' } : globalStyles.codexModalpassages)}>
          <ImageBackground
            source={parchmentSource}
            style={isMobile ? { flex: 1, padding: 0 } : globalStyles.codexPixelBorder}
            imageStyle={globalStyles.codexTextureOverlay}
          >
            <View style={isMobile ? { flex: 1, padding: 0 } : globalStyles.codexInnerpassages}>
              <View
                style={[
                  globalStyles.codexHeader,
                  { borderBottomColor: '#d4af37' },
                  isMobile && { paddingTop: 32, paddingHorizontal: 16 },
                ]}
              >
                <Text
                  style={[
                    globalStyles.codexTitle,
                    { 
                      color: '#4ee6e6',
                      fontSize: 28,
                      fontWeight: 'bold',
                      letterSpacing: 3,
                      textShadowColor: 'rgba(78, 230, 230, 0.5)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 8,
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

              <View style={globalStyles.codexTypeSelector}>
                <TouchableOpacity
                  style={[
                    globalStyles.codexTypeButton,
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

              <View style={isMobile ? { flex: 1, flexDirection: 'column', minHeight: 0 } : globalStyles.codexpassagesContainer}>
                {/* Your Quest Section - Always visible on mobile */}
                <View style={isMobile ? { 
                  padding: 12, 
                  paddingBottom: 8,
                  maxHeight: isMobile ? 200 : undefined, // Limit height on mobile
                  minHeight: isMobile ? 120 : undefined   // Ensure minimum height
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
                      isMobile && { fontSize: 16, marginBottom: 8 }
                    ]}
                  >
                    Your Quest
                  </Text>
                  <View style={[
                    globalStyles.codexPromptList,
                    isMobile && { maxHeight: 150, overflow: 'hidden' }
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
                              // Retry loading prompts
                              const loadPrompts = async () => {
                                setLoading(true);
                                try {
                                  const fallbackAreas = ['journal', 'draw', 'voice'];
                                  const completedStoriesArray = Array.from(archive.completedStories);
                                  await wellness.loadCategoryPrompts(fallbackAreas, completedStoriesArray);
                                } catch (error) {
                                  console.warn('Retry failed:', error);
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

                {/* Input Section - Takes remaining space on mobile */}
                <View style={isMobile ? { 
                  flex: 1, 
                  minHeight: 0, 
                  minWidth: 0, 
                  paddingHorizontal: 12,
                  paddingTop: 8
                } : globalStyles.codexInputSection}>
                  {selectedPrompt && selectedTypeState === "journal" && (
                    <TextInput
                      style={[
                        globalStyles.codexJournalInput,
                        { 
                          color: '#2c1810',
                          backgroundColor: 'rgba(244, 241, 232, 0.95)',
                          borderColor: '#d4af37',
                          borderWidth: 2,
                          shadowColor: '#8b4513',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        },
                        isMobile && { 
                          flex: 1, 
                          minHeight: 100,
                          fontSize: 14,
                          padding: 12
                        }
                      ]}
                      multiline
                      placeholder="Write your thoughts here..."
                      placeholderTextColor="#5d4037"
                      value={passages}
                      onChangeText={setpassages}
                    />
                  )}
                  {selectedPrompt && selectedTypeState === "draw" && (
                    <View style={{ 
                      flex: 1, 
                      minHeight: 0, 
                      minWidth: 0,
                      maxHeight: isMobile ? 300 : undefined // Limit height on mobile
                    }}>
                      <DrawingCanvas
                        onSave={(paths) => {
                          try {
                            setDrawingPaths(paths);
                            setpassages(JSON.stringify(paths));
                          } catch (error) {
                            console.error('Error saving drawing:', error);
                            Alert.alert('Error', 'Failed to save drawing. Please try again.');
                          }
                        }}
                        onCancel={() => {
                          try {
                            setDrawingPaths([]);
                            setpassages("");
                          } catch (error) {
                            console.error('Error canceling drawing:', error);
                          }
                        }}
                      />
                    </View>
                  )}
                  {selectedPrompt && selectedTypeState === "voice" && (
                    <View style={{ 
                      flex: 1, 
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: isMobile ? 200 : undefined
                    }}>
                      <VoiceMemoRecorder
                        onSave={(audioUri) => {
                          setpassages(audioUri);
                        }}
                        theme={theme.theme}
                      />
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  globalStyles.codexSaveButton,
                  (!selectedPrompt || !passages) &&
                    globalStyles.codexDisabledButton,
                  {
                    borderColor: '#4ee6e6',
                    borderWidth: 2,
                    backgroundColor: (!selectedPrompt || !passages) 
                      ? 'rgba(78, 230, 230, 0.2)' 
                      : '#4ee6e6',
                    shadowColor: '#4ee6e6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                    borderRadius: 20,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                  },
                ]}
                onPress={handleSave}
                disabled={!selectedPrompt || !passages}
              >
                <Text
                  style={[
                    globalStyles.codexSaveButtonText,
                    { 
                      color: (!selectedPrompt || !passages) ? '#d4af37' : '#0a0b0f',
                      fontWeight: 'bold',
                      fontSize: 16,
                      textShadowColor: (!selectedPrompt || !passages) ? 'rgba(212, 175, 55, 0.3)' : 'rgba(10, 11, 15, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    },
                  ]}
                >
                  Save to Codex
                </Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </View>
    </Modal>
    
    <FloatingRewardNotification
      visible={rewardNotification.visible}
      message={rewardNotification.message}
      type={rewardNotification.type}
      onHide={() => setRewardNotification(prev => ({ ...prev, visible: false }))}
    />
    </>
  );
};

export default CodexModal;

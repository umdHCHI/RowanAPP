import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useMasterState } from '../../context/MasterStateContext';
import { useStoryEngine } from '../../hooks/useStoryEngine'; // Make sure this path is correct
import { createGlobalStyles } from '../../styles/globalStyles';
import { Chapter, Choice, Passage, Story } from '../../types/story';

interface StoryScreenProps {
  visible: boolean;
  onClose: () => void;
  story: Story; // We need the story object for its ID, title, and attached chapterId
  chapter: Chapter;
  passage: Passage;
  choices: Choice[];
  onStatGain: (stat: string, amount: number) => void;
  onArtifactUnlock: (artifact: string) => void;
  onSkillLearned: (skill: string) => void;
  onStoryComplete?: (completionData: any) => void;
}

const StoryScreen: React.FC<StoryScreenProps> = ({
  visible,
  onClose,
  story,
  onStoryComplete,
}) => {
  const { theme } = useMasterState();
  const globalStyles = createGlobalStyles(theme.theme);

  const {
    loading,
    error,
    currentPassage,
    availableChoices,
    makeChoice,
    isInitialized,
    isEnding,
    hasMultipleChoices,
    isContinuableNarration,
  } = useStoryEngine({
    storyId: story?.id,
    chapterId: story?.chapterId,
  });

  const handlePassageTap = () => {
    if (loading) return;

    if (isEnding) {
      console.log('🏆 Story ending reached. Triggering completion.');
      onStoryComplete?.({ storyId: story.id /* add other completion data */ });
    } else if (isContinuableNarration) {
      // For narration, we automatically trigger the single "Continue" choice
      console.log('➡️ Tapped to continue narration, making implicit choice.');
      makeChoice(availableChoices[0]);
    }
  };
  
  // Main render function
  const renderContent = () => {
    if (loading && !isInitialized) {
      return (
        <View style={globalStyles.centeredMessageContainer}>
          <ActivityIndicator size="large" color="#A855F7" />
          <Text style={globalStyles.centeredMessageTitle}>Loading Story...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={globalStyles.centeredMessageContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
          <Text style={globalStyles.centeredMessageTitle}>Error Loading Story</Text>
          <Text style={globalStyles.centeredMessageText}>{error}</Text>
        </View>
      );
    }

    if (!currentPassage) {
        return (
            <View style={globalStyles.centeredMessageContainer}>
                <Text style={globalStyles.centeredMessageTitle}>Ready to begin.</Text>
            </View>
        );
    }

    const canTap = isContinuableNarration || isEnding;

    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingVertical: 20 }}>
        <TouchableOpacity 
          activeOpacity={canTap ? 0.7 : 1} 
          onPress={handlePassageTap}
          style={{ padding: 20 }}
        >
          <Text style={globalStyles.StoryPassageText}>
            {currentPassage.content}
          </Text>
          {canTap && (
            <Text style={{ ...globalStyles.centeredMessageText, color: '#A855F7', marginTop: 20, fontStyle: 'italic' }}>
              {isEnding ? '🏆 Tap to Complete Story' : 'Tap to continue...'}
            </Text>
          )}
        </TouchableOpacity>
        
        <View style={globalStyles.StoryChoicesContainer}>
          {hasMultipleChoices && availableChoices.map((choice: any, index: number) => (
            <TouchableOpacity
              key={choice.id || index}
              style={globalStyles.StoryChoiceButton}
              onPress={() => makeChoice(choice)}
              disabled={loading}
            >
              <Text style={globalStyles.StoryChoiceText}>{choice.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
        <View style={globalStyles.StoryModalOverlay}>
            <View style={globalStyles.StoryModalpassages}>
                <View style={globalStyles.StoryHeader}>
                    <Text style={globalStyles.StoryTitle}>{story?.title}</Text>
                    <TouchableOpacity style={globalStyles.StoryCloseButton} onPress={onClose}>
                        <Ionicons name="close-circle" size={24} style={globalStyles.StoryCloseIcon} />
                    </TouchableOpacity>
                </View>
                <View style={globalStyles.StoryMainpassages}>
                    {renderContent()}
                </View>
            </View>
        </View>
    </Modal>
  );
};

export default StoryScreen;
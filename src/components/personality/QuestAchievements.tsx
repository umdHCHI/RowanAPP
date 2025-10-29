import React from 'react';
import { Text, View } from 'react-native';
// import the PersonalityQuests value from the correct module
import { PersonalityKey, PersonalityQuests } from '../../imports';

interface QuestAchievementsProps {
  questProgress: Record<string, number>;
  primaryTrait: PersonalityKey;
  globalStyles: any;
}

export const QuestAchievements: React.FC<QuestAchievementsProps> = ({
  questProgress,
  primaryTrait,
  globalStyles
}) => {
  // Debug logging
  
  // Get quests ONLY for the current personality type
  const personalityQuests = (PersonalityQuests as any)[primaryTrait] || [];
  
  // Map quests with their progress
  const displayQuests = personalityQuests.map((quest: any) => {
    const progress = questProgress[quest.id] || 0;
    return { ...quest, progress };
  });
  
  
  return (
    <View style={globalStyles.personalityQuestsContainer}>
      <Text style={globalStyles.personalityQuestsTitle}>Active Quests</Text>
      <Text style={globalStyles.personalityQuestsSubtitle}>
        Your Quest Progress
      </Text>
      
      {displayQuests.map((quest: any) => {
        const progress = quest.progress || 0;
        const isCompleted = progress >= quest.total;
        const progressPercentage = (progress / quest.total) * 100;

        return (
          <View key={quest.id} style={[globalStyles.personalityQuestCard, isCompleted && globalStyles.personalityQuestCompleted]}>
            <Text style={globalStyles.personalityQuestTitle}>
              {quest.title}
            </Text>
            <Text style={globalStyles.personalityQuestDescription}>{quest.description}</Text>
            <View style={globalStyles.personalityQuestProgress}>
              <View style={globalStyles.personalityQuestProgressBar}>
                <View
                  style={[
                    globalStyles.personalityQuestProgressFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
              <Text style={globalStyles.personalityQuestProgressText}>
                {progress}/{quest.total} {isCompleted ? "✅" : ""}
              </Text>
            </View>
          </View>
        );
      })}
      
      {displayQuests.length === 0 && (
        <View style={globalStyles.personalityQuestCard}>
          <Text style={globalStyles.personalityQuestTitle}>No Active Quests</Text>
          <Text style={globalStyles.personalityQuestDescription}>
            Complete stories to unlock and progress on quests!
          </Text>
        </View>
      )}
    </View>
  );
};

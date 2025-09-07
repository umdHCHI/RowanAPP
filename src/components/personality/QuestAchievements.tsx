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
  console.log('=== QuestAchievements Debug ===');
  console.log('Primary trait:', primaryTrait);
  console.log('Quest progress received:', questProgress);
  
  // Find all quests that the user actually has progress for
  const questsWithProgress: any[] = [];
  const questsWithoutProgress: any[] = [];
  
  // Check all personality types for quests that match the user's quest progress
  Object.entries(PersonalityQuests as any).forEach(([personalityType, quests]: [string, any]) => {
    quests.forEach((quest: any) => {
      const progress = questProgress[quest.id] || 0;
      if (progress > 0) {
        questsWithProgress.push({ ...quest, personalityType });
        console.log(`✅ Found quest with progress: ${quest.id} (${quest.title}): ${progress}/${quest.total}`);
      } else if (personalityType === primaryTrait) {
        // Only include quests without progress from the primary trait
        questsWithoutProgress.push({ ...quest, personalityType });
      }
    });
  });
  
  // Combine: first show quests with progress, then primary trait quests without progress
  const displayQuests = [...questsWithProgress, ...questsWithoutProgress];
  
  console.log('Quests with progress:', questsWithProgress.length);
  console.log('Primary trait quests without progress:', questsWithoutProgress.length);
  console.log('Total quests to display:', displayQuests.length);
  
  return (
    <View style={globalStyles.personalityQuestsContainer}>
      <Text style={globalStyles.personalityQuestsTitle}>Active Quests</Text>
      <Text style={globalStyles.personalityQuestsSubtitle}>
        Your Quest Progress
      </Text>
      
      {displayQuests.map((quest: any) => {
        const progress = questProgress[quest.id] || 0;
        const isCompleted = progress >= quest.total;
        const progressPercentage = (progress / quest.total) * 100;
        const isFromDifferentTrait = quest.personalityType !== primaryTrait;

        return (
          <View key={quest.id} style={[globalStyles.personalityQuestCard, isCompleted && globalStyles.personalityQuestCompleted]}>
            <Text style={globalStyles.personalityQuestTitle}>
              {quest.title}
              {isFromDifferentTrait && (
                <Text style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>
                  {' '}({quest.personalityType})
                </Text>
              )}
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

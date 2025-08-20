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
  // Get quests for the user's primary personality type
  const primaryQuests = (PersonalityQuests as any)[primaryTrait] || [];
  
  // Debug logging
  console.log('=== QuestAchievements Debug ===');
  console.log('Primary trait:', primaryTrait);
  console.log('Quest progress received:', questProgress);
  console.log('Primary quests for this trait:', primaryQuests.map((q: any) => ({ id: q.id, title: q.title })));
  
  // Check for quest progress matches
  primaryQuests.forEach((quest: any) => {
    const progress = questProgress[quest.id] || 0;
    console.log(`Quest ${quest.id} (${quest.title}): ${progress}/${quest.total} (${progress >= quest.total ? 'COMPLETED' : 'in progress'})`);
  });
  
  return (
    <View style={globalStyles.personalityQuestsContainer}>
      <Text style={globalStyles.personalityQuestsTitle}>Active Quests</Text>
      <Text style={globalStyles.personalityQuestsSubtitle}>
        {primaryTrait} Scholar Challenges
      </Text>
      
      {primaryQuests.map((quest: any) => {
        const progress = questProgress[quest.id] || 0;
        const isCompleted = progress >= quest.total;
        const progressPercentage = (progress / quest.total) * 100;

        return (
          <View key={quest.id} style={[globalStyles.personalityQuestCard, isCompleted && globalStyles.personalityQuestCompleted]}>
            <Text style={globalStyles.personalityQuestTitle}>{quest.title}</Text>
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
      
      {/* Show cross-personality quest progress if any exist */}
      {Object.entries(PersonalityQuests as any).some(([personalityType, quests]: [string, any]) => 
        personalityType !== primaryTrait && 
        quests.some((quest: any) => (questProgress[quest.id] || 0) > 0)
      ) && (
        <View style={globalStyles.personalityCrossQuestsSection}>
          <Text style={globalStyles.personalityCrossQuestsTitle}>
            📚 Universal Progress
          </Text>
          <Text style={globalStyles.personalityCrossQuestsSubtitle}>
            Growth across all personality chambers
          </Text>
          
          {Object.entries(PersonalityQuests as any).map(([personalityType, quests]: [string, any]) => {
            if (personalityType === primaryTrait) return null;
            
            const questsWithProgress = quests.filter((quest: any) => (questProgress[quest.id] || 0) > 0);
            if (questsWithProgress.length === 0) return null;
            
            return (
              <View key={personalityType} style={globalStyles.personalityCrossQuestGroup}>
                <Text style={globalStyles.personalityCrossQuestGroupTitle}>
                  {personalityType} Chamber
                </Text>
                {questsWithProgress.map((quest: any) => {
                  const progress = questProgress[quest.id] || 0;
                  const isCompleted = progress >= quest.total;
                  const progressPercentage = (progress / quest.total) * 100;

                  return (
                    <View key={quest.id} style={[globalStyles.personalityCrossQuestCard, isCompleted && globalStyles.personalityCrossQuestCompleted]}>
                      <Text style={globalStyles.personalityCrossQuestTitle}>{quest.title}</Text>
                      <View style={globalStyles.personalityCrossQuestProgress}>
                        <View style={globalStyles.personalityCrossQuestProgressBar}>
                          <View
                            style={[
                              globalStyles.personalityCrossQuestProgressFill,
                              { width: `${progressPercentage}%` },
                            ]}
                          />
                        </View>
                        <Text style={globalStyles.personalityCrossQuestProgressText}>
                          {progress}/{quest.total} {isCompleted ? "✅" : ""}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

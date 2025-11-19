import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, AccessibilityInfo } from 'react-native';
// import the PersonalityQuests value from the correct module
import { PersonalityKey, PersonalityQuests, PersonalityConfigs } from '../../imports';
import RuneBackground from '../../ui/RuneBackground';
import RunicThreadBar from '../../ui/RunicThreadBar';

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
  // Check for reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      setReducedMotion(enabled);
    });
  }, []);

  // Get personality config for theming
  const config = PersonalityConfigs[primaryTrait];
  const palette = {
    primary: config?.theme?.primary || '#4ee6e6',
    secondary: config?.theme?.secondary || '#ccc',
    accent: config?.theme?.accent || '#ffd43b',
  };

  // Get quests ONLY for the current personality type
  const personalityQuests = (PersonalityQuests as any)[primaryTrait] || [];

  // Map quests with their progress
  const displayQuests = personalityQuests.map((quest: any) => {
    const progress = questProgress[quest.id] || 0;
    return { ...quest, progress };
  });

  // Show up to 3 quests (prioritize incomplete quests first)
  const incompleteQuests = displayQuests.filter((q: any) => q.progress < q.total);
  const completedQuests = displayQuests.filter((q: any) => q.progress >= q.total);
  const questsToShow = [...incompleteQuests, ...completedQuests].slice(0, 3);

  return (
    <View style={[globalStyles.personalityQuestsContainer, styles.container]}>
      <RuneBackground palette={palette} reducedMotion={reducedMotion} />

      {/* Quest Journal Header */}
      <View style={styles.headerRow}>
        <Text style={[globalStyles.personalityQuestsTitle, styles.title]}>
          Active Quests
        </Text>
        {displayQuests.length > 0 && (
          <Text style={[styles.questCount, { color: palette.primary }]}>
            {displayQuests.length} Active
          </Text>
        )}
      </View>

      {questsToShow.length > 0 ? (
        <View style={styles.questsContainer}>
          {questsToShow.map((quest: any, index: number) => {
            const isQuestComplete = quest.progress >= quest.total;
            const progressPercent = Math.floor((quest.progress / quest.total) * 100);

            return (
              <View
                key={quest.id || index}
                style={[
                  styles.questCard,
                  {
                    backgroundColor: '#0a0e14',
                    borderColor: `${palette.primary}40`,
                  }
                ]}
              >
                {/* Quest Header with Ornamental Corner */}
                <View style={styles.questHeader}>
                  <View style={[styles.cornerOrnament, { borderColor: `${palette.primary}60` }]} />
                  <View style={styles.questTitleSection}>
                    <View style={styles.questTitleRow}>
                      <View style={[styles.questMarker, {
                        backgroundColor: isQuestComplete ? `${palette.accent}20` : `${palette.primary}20`,
                        borderColor: isQuestComplete ? `${palette.accent}60` : `${palette.primary}60`
                      }]}>
                        <Text style={[styles.questMarkerText, {
                          color: isQuestComplete ? `${palette.accent}` : `${palette.primary}`
                        }]}>
                          {isQuestComplete ? '✓' : '•'}
                        </Text>
                      </View>
                      <Text style={[styles.questTitle]} numberOfLines={2}>
                        {quest.title}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Quest Description */}
                <Text style={styles.questDescription} numberOfLines={2}>
                  {quest.description}
                </Text>

                {/* Progress Section - Foundry Style */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Progress</Text>
                    <View style={styles.progressFraction}>
                      <Text style={[styles.progressCurrent, { color: `${palette.primary}90` }]}>
                        {quest.progress}
                      </Text>
                      <Text style={styles.progressSeparator}>/</Text>
                      <Text style={styles.progressTotal}>{quest.total}</Text>
                      <Text style={styles.progressPercent}>({progressPercent}%)</Text>
                    </View>
                  </View>

                  {/* Progress Track */}
                  <View style={[styles.progressTrack, { borderColor: `${palette.primary}20` }]}>
                    {[...Array(quest.total)].map((_, i) => {
                      const isFilled = i < quest.progress;
                      return (
                        <View
                          key={i}
                          style={[
                            styles.progressPip,
                            {
                              backgroundColor: isFilled
                                ? (isQuestComplete ? `${palette.accent}` : `${palette.primary}`)
                                : 'rgba(26, 32, 40, 0.5)',
                              borderColor: isFilled
                                ? (isQuestComplete ? `${palette.accent}` : `${palette.primary}`)
                                : 'rgba(42, 48, 56, 0.8)',
                            }
                          ]}
                        />
                      );
                    })}
                  </View>

                  {/* Status Badge */}
                  {isQuestComplete && (
                    <View style={[styles.completeBadge, {
                      backgroundColor: `${palette.accent}10`,
                      borderColor: `${palette.accent}60`
                    }]}>
                      <Text style={[styles.completeText, { color: `${palette.accent}` }]}>
                        COMPLETE
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={[styles.emptyCard, { borderColor: `${palette.primary}30` }]}>
          <Text style={styles.emptyIcon}>📜</Text>
          <Text style={styles.emptyTitle}>No Active Quests</Text>
          <Text style={styles.emptyText}>
            Complete stories to unlock new quests
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d0d8e0',
  },
  questCount: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  questsContainer: {
    gap: 12,
  },
  questCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    position: 'relative',
  },
  questHeader: {
    position: 'relative',
    marginBottom: 10,
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
  questTitleSection: {
    paddingLeft: 4,
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  questMarker: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  questMarkerText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
  },
  questTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    flex: 1,
    color: '#c8d0d8',
  },
  questDescription: {
    fontSize: 12,
    lineHeight: 16,
    color: '#9aa8b8',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  progressContainer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6a7a8a',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressFraction: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  progressCurrent: {
    fontSize: 16,
    fontWeight: '900',
  },
  progressSeparator: {
    fontSize: 14,
    color: '#4a5a6a',
    fontWeight: '600',
  },
  progressTotal: {
    fontSize: 13,
    color: '#6a7a8a',
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 11,
    color: '#5a6a7a',
    fontWeight: '600',
    marginLeft: 4,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 4,
    padding: 6,
    backgroundColor: '#050810',
    borderRadius: 6,
    borderWidth: 1,
    flexWrap: 'wrap',
  },
  progressPip: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
  },
  completeBadge: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  completeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#050810',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
    opacity: 0.4,
  },
  emptyTitle: {
    fontSize: 14,
    color: '#d0d8e0',
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#7a8a9a',
    lineHeight: 18,
  },
});

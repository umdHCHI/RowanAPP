import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Image, StyleSheet, Text, View } from 'react-native';
import { useMasterState } from "../../context/MasterStateContext";
import { PersonalityConfigs, PersonalityWellnessAttributes } from '../../imports';
import { WellnessAttributesDisplayProps } from '../../types/index';
import { EchoesMeter } from '../../ui/EchoesMeter';
import RuneBackground from '../../ui/RuneBackground';

export const WellnessAttributesDisplay: React.FC<WellnessAttributesDisplayProps> = ({
  personalityType,
  personalityScores,
  storyProgress,
  globalStyles
}) => {

  const personalityAttributes = PersonalityWellnessAttributes[personalityType]?.attributes || PersonalityWellnessAttributes.Openness.attributes;

  const {
    theme,
    auth,
    character,
    wellness
  } = useMasterState();

  const userUnlockedTools = wellness.myTools || [];

  // Check for reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      setReducedMotion(enabled);
    });
  }, []);

  // Get personality config for theming
  const config = PersonalityConfigs[personalityType];
  const palette = {
    primary: config?.theme?.primary || '#4ee6e6',
    secondary: config?.theme?.secondary || '#ccc',
    accent: config?.theme?.accent || '#ffd43b',
  };

  // FIXED: Use personalityScores prop as primary source, fallback to character context
  const getWellnessValue = (wellnessProperty: string): number => {
    let baseValue = 0;

    // PRIMARY: Use personalityScores prop if available (from PersonalityHomeScreen)
    if (personalityScores && typeof personalityScores === 'object') {
      // Handle both array format and object format
      if (Array.isArray(personalityScores)) {
        const labelMap: Record<string, string> = {
          'awareness': 'Exploration',
          'resilience': 'Courage',
          'connection': 'Connection',
          'balance': 'Fear'
        };

        const stat = personalityScores.find((s: any) =>
          s.label === labelMap[wellnessProperty]
        );
        baseValue = stat?.value || 0;
      } else {
        // Object format - direct property access
        baseValue = personalityScores[wellnessProperty] || 0;
      }
    }
    // FALLBACK: Use character context if no personalityScores prop
    else {
      const characterData = character.backendCharacter;

      if (characterData) {
        // Direct property access (following The Archive's dual research path architecture)
        const characterObj = characterData as any;
        if (characterObj[wellnessProperty] !== undefined) {
          baseValue = characterObj[wellnessProperty];
        }
        // Check wellness_stats array format for character users
        else if (characterObj.wellness_stats && Array.isArray(characterObj.wellness_stats)) {
          const labelMap: Record<string, string> = {
            'awareness': 'Exploration',
            'resilience': 'Courage',
            'connection': 'Connection',
            'balance': 'Fear'
          };

          const stat = characterObj.wellness_stats.find((s: any) =>
            s.label === labelMap[wellnessProperty]
          );
          baseValue = stat?.value || 0;
        }
      } else {
        // For personality users or new users - start at 0 and build through story rewards
        baseValue = 0;
      }
    }

    // Ensure valid number
    if (baseValue === undefined || baseValue === null || isNaN(baseValue)) {
      baseValue = 0;
    }

    return baseValue;
  };

  // Map personality attributes to wellness stats with tool bonuses
  const characterAttributes = personalityAttributes.map((attr: any, index: number) => {
    const baseValue = getWellnessValue(attr.wellnessProperty);

    // Calculate tool bonus for The Archive's dual research path system
    let toolBonus = 0;
    if (userUnlockedTools && userUnlockedTools.length > 0) {
      userUnlockedTools.forEach(tool => {
        switch (attr.wellnessProperty) {
          case 'awareness':
            toolBonus += tool.awareness_bonus || 0;
            break;
          case 'resilience':
            toolBonus += tool.resilience_bonus || 0;
            break;
          case 'connection':
            toolBonus += tool.connection_bonus || 0;
            break;
          case 'balance':
            toolBonus += tool.balance_bonus || 0;
            break;
        }
      });
    }

    const totalValue = baseValue + toolBonus;

    // Calculate level progression (1-5 levels)
    const maxValue = 20;
    const currentLevel = Math.floor(totalValue / 5) + 1;
    const progressInCurrentLevel = totalValue % 5;
    const xpToNextLevel = totalValue >= maxValue ? 0 : 5 - progressInCurrentLevel;

    // Map to lore meter variants
    const variants = ['lantern', 'tether', 'weave', 'lens'] as const;
    const variant = variants[index % variants.length];

    // Lore-friendly completion messages
    const completionMessages: Record<typeof variant, string> = {
      lantern: 'Fully Lit',
      tether: 'Thread Secured',
      weave: 'Pattern Holds',
      lens: 'Crystal Clear',
    };

    // Curator notes with lore flavor
    const curatorNotes: Record<string, string> = {
      awareness: "Wild ideas become a single beam that guides your steps.",
      resilience: "The thread that keeps you anchored when storms pull at every edge.",
      connection: "Threads crossing and strengthening one another. No knot stands alone.",
      balance: "Fog lifts to reveal what was always there. Clarity is absence of noise.",
    };

    return {
      icon: attr.icon,
      label: attr.label,
      value: totalValue,
      baseValue: baseValue,
      toolBonus: toolBonus,
      color: attr.color,
      description: attr.description,
      wellnessProperty: attr.wellnessProperty,
      variant,
      completionMessage: totalValue >= 20 ? completionMessages[variant] : '',
      curatorNote: curatorNotes[attr.wellnessProperty] || attr.description,
      maxValue,
      currentLevel,
      progressInCurrentLevel,
      xpToNextLevel,
    };
  });

  return (
    <View style={[globalStyles.personalityAttributesContainer, styles.container]}>
      <RuneBackground palette={palette} reducedMotion={reducedMotion} />

      <Text style={[globalStyles.personalityEchoesTitle, styles.title]}>
        Character Stats
      </Text>

      <View style={styles.grid}>
        {characterAttributes.map((attr: any, index: number) => {
          const isMaxLevel = attr.value >= attr.maxValue;
          const currentLevelXP = attr.value % 5; // XP in current level
          const xpForLevel = 5; // XP needed per level
          const levelProgress = (currentLevelXP / xpForLevel) * 100;

          return (
            <View
              key={index}
              style={[
                styles.card,
                isMaxLevel && {
                  borderColor: palette.accent,
                  shadowColor: palette.accent,
                  backgroundColor: `${palette.accent}08`
                }
              ]}
            >
              {/* Stat Icon + Name */}
              <View style={styles.statHeader}>
                {typeof attr.icon === 'string' ? (
                  <Text style={styles.statIcon}>{attr.icon}</Text>
                ) : (
                  <Image source={attr.icon} style={styles.statIconImage} resizeMode="contain" />
                )}
                <Text style={[styles.statName, { color: palette.primary }]} numberOfLines={1}>
                  {attr.label.toUpperCase()}
                </Text>
              </View>

              {/* Level Display */}
              <View style={styles.levelRow}>
                <View style={[styles.levelBox, { borderColor: isMaxLevel ? palette.accent : palette.primary }]}>
                  <Text style={styles.levelLabel}>LVL</Text>
                  <Text style={[styles.levelNumber, { color: isMaxLevel ? palette.accent : palette.primary }]}>
                    {attr.currentLevel}
                  </Text>
                </View>

                {/* XP Progress */}
                <View style={styles.xpSection}>
                  {!isMaxLevel ? (
                    <>
                      <View style={styles.xpBar}>
                        <View style={[styles.xpBarBg, { backgroundColor: `${palette.primary}15` }]}>
                          <View
                            style={[styles.xpBarFill, {
                              width: `${levelProgress}%`,
                              backgroundColor: palette.primary
                            }]}
                          />
                        </View>
                        <Text style={styles.xpBarText}>
                          <Text style={{ color: palette.primary, fontWeight: '800' }}>{currentLevelXP}</Text>
                          <Text style={{ color: '#5a6a7a' }}>/{xpForLevel}</Text>
                        </Text>
                      </View>
                      <Text style={[styles.xpToNext, { color: palette.accent }]}>
                        +{attr.xpToNextLevel} XP → LVL {attr.currentLevel + 1}
                      </Text>
                    </>
                  ) : (
                    <View style={[styles.maxed, { backgroundColor: `${palette.accent}20`, borderColor: palette.accent }]}>
                      <Text style={[styles.maxedText, { color: palette.accent }]}>★ MAXED ★</Text>
                      <Text style={[styles.maxedSub, { color: palette.accent }]}>{attr.completionMessage}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Total Stat Value */}
              <View style={[styles.totalStatBar, { borderColor: `${palette.primary}30` }]}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <View style={styles.totalPips}>
                  {[...Array(4)].map((_, i) => {
                    const filled = Math.floor(attr.value / 5) > i;
                    return (
                      <View
                        key={i}
                        style={[
                          styles.pip,
                          {
                            backgroundColor: filled ? palette.accent : '#1a2028',
                            borderColor: filled ? palette.accent : '#2a3038'
                          }
                        ]}
                      />
                    );
                  })}
                </View>
                <Text style={[styles.totalValue, { color: palette.accent }]}>
                  {attr.value}<Text style={styles.totalMax}>/{attr.maxValue}</Text>
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    backgroundColor: '#0a0e14',
    borderWidth: 2,
    borderColor: 'rgba(78, 230, 230, 0.3)',
    borderRadius: 12,
    padding: 10,
    width: '48%',
    minHeight: 155,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(78, 230, 230, 0.15)',
  },
  statIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  statIconImage: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  statName: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    flex: 1,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  levelBox: {
    width: 52,
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#050810',
  },
  levelLabel: {
    fontSize: 8,
    color: '#6a7a8a',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  levelNumber: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  xpSection: {
    flex: 1,
    justifyContent: 'center',
  },
  xpBar: {
    marginBottom: 4,
  },
  xpBarBg: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'rgba(78, 230, 230, 0.2)',
  },
  xpBarFill: {
    height: '100%',
    minWidth: 3,
  },
  xpBarText: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  xpToNext: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  maxed: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  maxedText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  maxedSub: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.9,
  },
  totalStatBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  totalLabel: {
    fontSize: 8,
    color: '#5a6a7a',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  totalPips: {
    flexDirection: 'row',
    gap: 3,
    flex: 1,
  },
  pip: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  totalMax: {
    fontSize: 11,
    color: '#5a6a7a',
    fontWeight: '600',
  },
});

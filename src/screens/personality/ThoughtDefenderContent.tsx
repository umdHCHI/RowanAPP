import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, AccessibilityInfo } from 'react-native';
import { PersonalityConfigs, PersonalityKey } from '../../imports';
import RuneBackground from '../../ui/RuneBackground';

interface ThoughtDefenderContentProps {
  onClose: () => void;
  onScoreUpdate: (data: any) => void;
  onStartGame: () => void;
  primaryTrait: PersonalityKey;
}

export const ThoughtDefenderContent: React.FC<ThoughtDefenderContentProps> = ({
  onClose,
  onScoreUpdate,
  onStartGame,
  primaryTrait
}) => {
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

  return (
    <View style={styles.container}>
      <RuneBackground palette={palette} reducedMotion={reducedMotion} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: '#d0d8e0' }]}>
          Mind Defender
        </Text>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Combat Training Arena
      </Text>

      {/* Main Content Card */}
      <View style={[styles.mainCard, { borderColor: `${palette.primary}40` }]}>
        {/* Corner Ornament */}
        <View style={[styles.cornerOrnament, { borderColor: `${palette.primary}60` }]} />

        {/* Training Overview */}
        <View style={styles.overviewSection}>
          <View style={[styles.iconBadge, {
            backgroundColor: `${palette.primary}20`,
            borderColor: `${palette.primary}60`
          }]}>
            <Text style={styles.mainIcon}>🛡️</Text>
          </View>

          <Text style={styles.trainingTitle}>Mental Resilience Training</Text>
          <Text style={styles.trainingDescription}>
            Enter the Hall of Dissonance where stray thoughts take shape. Train your mind to deflect negativity and strengthen your mental defenses.
          </Text>
        </View>

        {/* Training Mechanics */}
        <View style={[styles.mechanicsSection, { borderTopColor: `${palette.primary}20` }]}>
          <Text style={styles.mechanicsTitle}>COMBAT MECHANICS</Text>
          <View style={styles.mechanicsGrid}>
            <View style={styles.mechanicItem}>
              <View style={[styles.mechanicIcon, {
                backgroundColor: `${palette.primary}15`,
                borderColor: `${palette.primary}60`
              }]}>
                <Text style={styles.mechanicEmoji}>🛡️</Text>
              </View>
              <Text style={styles.mechanicLabel}>Defend</Text>
              <Text style={styles.mechanicDesc}>Block negative thoughts</Text>
            </View>

            <View style={styles.mechanicItem}>
              <View style={[styles.mechanicIcon, {
                backgroundColor: `${palette.accent}15`,
                borderColor: `${palette.accent}60`
              }]}>
                <Text style={styles.mechanicEmoji}>⚡</Text>
              </View>
              <Text style={styles.mechanicLabel}>Collect</Text>
              <Text style={styles.mechanicDesc}>Gather power-ups</Text>
            </View>

            <View style={styles.mechanicItem}>
              <View style={[styles.mechanicIcon, {
                backgroundColor: `${palette.primary}15`,
                borderColor: `${palette.primary}60`
              }]}>
                <Text style={styles.mechanicEmoji}>💪</Text>
              </View>
              <Text style={styles.mechanicLabel}>Survive</Text>
              <Text style={styles.mechanicDesc}>Endure the waves</Text>
            </View>

            <View style={styles.mechanicItem}>
              <View style={[styles.mechanicIcon, {
                backgroundColor: `${palette.accent}15`,
                borderColor: `${palette.accent}60`
              }]}>
                <Text style={styles.mechanicEmoji}>🏆</Text>
              </View>
              <Text style={styles.mechanicLabel}>Triumph</Text>
              <Text style={styles.mechanicDesc}>Unlock abilities</Text>
            </View>
          </View>
        </View>

        {/* Rewards Preview */}
        <View style={[styles.rewardsSection, { borderTopColor: `${palette.primary}20` }]}>
          <Text style={styles.rewardsTitle}>TRAINING REWARDS</Text>
          <View style={styles.rewardsList}>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>✨</Text>
              <Text style={[styles.rewardText, { color: `${palette.primary}90` }]}>
                Mental Resilience XP
              </Text>
            </View>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>🎯</Text>
              <Text style={[styles.rewardText, { color: `${palette.primary}90` }]}>
                Focus Enhancement
              </Text>
            </View>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>🔓</Text>
              <Text style={[styles.rewardText, { color: `${palette.accent}90` }]}>
                New Defensive Abilities
              </Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[styles.startButton, {
            backgroundColor: `${palette.primary}`,
            borderColor: `${palette.primary}`
          }]}
          onPress={onStartGame}
        >
          <Text style={styles.startButtonText}>Begin Training</Text>
        </TouchableOpacity>

        {/* Footer Note */}
        <Text style={styles.footerNote}>
          Complete waves to strengthen your mental defenses
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    color: '#8fa3b8',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  mainCard: {
    flex: 1,
    backgroundColor: '#0a0e14',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    position: 'relative',
  },
  cornerOrnament: {
    position: 'absolute',
    top: -16,
    left: -16,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 8,
  },
  overviewSection: {
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 20,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mainIcon: {
    fontSize: 32,
  },
  trainingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#c8d0d8',
    marginBottom: 12,
    textAlign: 'center',
  },
  trainingDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#9aa8b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mechanicsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    marginBottom: 16,
  },
  mechanicsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6a7a8a',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  mechanicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  mechanicItem: {
    alignItems: 'center',
    width: '45%',
  },
  mechanicIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  mechanicEmoji: {
    fontSize: 24,
  },
  mechanicLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#c8d0d8',
    marginBottom: 2,
  },
  mechanicDesc: {
    fontSize: 10,
    color: '#7a8a9a',
    textAlign: 'center',
  },
  rewardsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    marginBottom: 20,
  },
  rewardsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6a7a8a',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  rewardsList: {
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  rewardIcon: {
    fontSize: 16,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerNote: {
    fontSize: 11,
    color: '#6a7a8a',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

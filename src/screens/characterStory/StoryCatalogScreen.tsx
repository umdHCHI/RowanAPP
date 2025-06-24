import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../context/ThemeContext';
import { createGlobalStyles } from '../../styles/globalStyles';

const { width } = Dimensions.get('window');

export type Grimoire = {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: string;
  timeToComplete: string;
  exploration: number;
  revelations: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  skillFocus: string[];
  atmosphere: string;
  statBoosts: string[];
  unlockLevel: number;
  isLocked?: boolean;
  passages?: any[];
};

type GrimoireCatalogModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectGrimoire: (grimoire: Grimoire) => void;
};

export const availableGrimoires: Grimoire[] = [
  {
    id: '1',
    title: 'Chronicle of the Fractured Mind',
    category: 'Academic Pressures Archive',
    description: 'Navigate the labyrinthine passages where academic stress echoes through memory halls. Master the ancient arts of mindful focus and strategic thinking.',
    difficulty: 'Deep Introspection',
    timeToComplete: '15 min',
    exploration: 65,
    revelations: 3,
    rarity: 'Epic',
    skillFocus: ['Mindfulness', 'Stress Management', 'Academic Balance'],
    atmosphere: 'Dimly lit corridors with floating equations',
    statBoosts: ['Sight Beyond Sight', 'Elemental Harmony'],
    unlockLevel: 1,
    isLocked: false,
  },
  {
    id: '2',
    title: 'The Perfectionist\'s Paradox',
    category: 'Self-Relationship Vault',
    description: 'Explore the gilded chambers where impossible standards create beautiful prisons. Learn the forbidden art of self-compassion and authentic growth.',
    difficulty: 'Shadow Work',
    timeToComplete: '20 min',
    exploration: 0,
    revelations: 0,
    rarity: 'Legendary',
    skillFocus: ['Self-Compassion', 'Growth Mindset', 'Inner Critic Work'],
    atmosphere: 'Glittering halls with broken mirrors',
    statBoosts: ['Heart\'s Compass', 'Unbreakable Will'],
    unlockLevel: 1,
    isLocked: false,
  },
  {
    id: '3',
    title: 'Codex of Social Anxieties',
    category: 'Connection & Communication Archive',
    description: 'Decipher the ancient runes of social connection. Master spells of authentic communication and courage in the face of judgment.',
    difficulty: 'Courage Building',
    timeToComplete: '18 min',
    exploration: 25,
    revelations: 1,
    rarity: 'Rare',
    skillFocus: ['Social Skills', 'Anxiety Management', 'Authenticity'],
    atmosphere: 'Crowded halls where whispers echo with judgment',
    statBoosts: ['Heart\'s Compass', 'Sight Beyond Sight'],
    unlockLevel: 3,
    isLocked: false,
  },
  {
    id: '4',
    title: 'Grimoire of Overwhelming Tides',
    category: 'Emotional Regulation Sanctum',
    description: 'Navigate the tempestuous waters of overwhelming emotions. Learn ancient techniques to ride the waves rather than be swept away.',
    difficulty: 'Emotional Mastery',
    timeToComplete: '25 min',
    exploration: 0,
    revelations: 0,
    rarity: 'Epic',
    skillFocus: ['Emotional Regulation', 'Distress Tolerance', 'Grounding'],
    atmosphere: 'Stormy chambers with crashing waves of feeling',
    statBoosts: ['Unbreakable Will', 'Elemental Harmony'],
    unlockLevel: 5,
    isLocked: true,
  },
  {
    id: '5',
    title: 'Manual of Life Balance',
    category: 'Harmony & Wellness Archive',
    description: 'Study the sacred geometry of work-life balance. Master the delicate art of saying no while still achieving your dreams.',
    difficulty: 'Life Architecture',
    timeToComplete: '22 min',
    exploration: 80,
    revelations: 4,
    rarity: 'Rare',
    skillFocus: ['Boundary Setting', 'Time Management', 'Self-Care'],
    atmosphere: 'Balanced chambers with scales of light and shadow',
    statBoosts: ['Elemental Harmony', 'Unbreakable Will'],
    unlockLevel: 2,
    isLocked: false,
  },
  {
    id: '6',
    title: 'Grimoire of Inner Transformation',
    category: 'Advanced Self-Mastery',
    description: 'The most powerful grimoire in the Archive. Synthesize all learned wisdom into a personal philosophy of resilience and growth.',
    difficulty: 'Mastery Integration',
    timeToComplete: '35 min',
    exploration: 0,
    revelations: 0,
    rarity: 'Legendary',
    skillFocus: ['Integration', 'Wisdom Synthesis', 'Life Philosophy'],
    atmosphere: 'Radiant chambers where all knowledge converges',
    statBoosts: ['All Foundations'],
    unlockLevel: 10,
    isLocked: true,
  },
];

const GrimoireCatalogModal = ({ visible, onClose, onSelectGrimoire }: GrimoireCatalogModalProps) => {
  const { theme } = useTheme();
  const globalStyles = createGlobalStyles(theme);

  const getRarityColors = (rarity: string): readonly [string, string] => {
    switch (rarity) {
      case 'Legendary': return [theme.rarityLegendary, '#FCD34D'];
      case 'Epic': return [theme.rarityEpic, '#F472B6'];
      case 'Rare': return [theme.rarityRare, '#06B6D4'];
      default: return [theme.rarityCommon, '#9CA3AF'];
    }
  };

  const getRarityGlow = (rarity: string): string => {
    switch (rarity) {
      case 'Legendary': return 'rgba(249, 115, 22, 0.3)';
      case 'Epic': return 'rgba(168, 85, 247, 0.3)';
      case 'Rare': return 'rgba(59, 130, 246, 0.3)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  };

  const GrimoireCard = ({ grimoire }: { grimoire: Grimoire }) => (
    <TouchableOpacity
      style={[globalStyles.grimoireCard, { opacity: grimoire.isLocked ? 0.6 : 1 }]}
      onPress={() => !grimoire.isLocked && onSelectGrimoire(grimoire)}
      activeOpacity={grimoire.isLocked ? 1 : 0.8}
      disabled={grimoire.isLocked}
    >
      <LinearGradient
        colors={[theme.archiveGradientStart, theme.archiveGradientMiddle, theme.archiveGradientEnd]}
        style={globalStyles.grimoireCardGradient}
      >
        <BlurView intensity={10} style={globalStyles.grimoireCardBlur}>
          {/* Rarity Border */}
          <LinearGradient
            colors={getRarityColors(grimoire.rarity)}
            style={globalStyles.grimoireRarityBorder}
          />
          
          {/* Lock Overlay */}
          {grimoire.isLocked && (
            <View style={globalStyles.grimoireLockOverlay}>
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.6)']}
                style={globalStyles.grimoireLockGradient}
              >
                <Icon name="lock" size={24} color={theme.archiveAccent} />
                <Text style={[globalStyles.grimoireLockText, { color: theme.archiveAccent }]}>Level {grimoire.unlockLevel} Required</Text>
              </LinearGradient>
            </View>
          )}

          {/* Header */}
          <View style={globalStyles.grimoireCardHeader}>
            <View style={globalStyles.grimoireTitleSection}>
              <Text style={[globalStyles.grimoireCardTitle, { color: theme.archiveAccentSecondary }]}>{grimoire.title}</Text>
              <Text style={[globalStyles.grimoireCardCategory, { color: theme.archiveSubtext }]}>{grimoire.category}</Text>
            </View>
            
            <View style={globalStyles.grimoireRarityBadge}>
              <LinearGradient
                colors={getRarityColors(grimoire.rarity)}
                style={globalStyles.grimoireRarityBadgeGradient}
              >
                <Text style={globalStyles.grimoireRarityBadgeText}>{grimoire.rarity}</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Progress Indicator */}
          {grimoire.exploration > 0 && (
            <View style={globalStyles.grimoireProgressSection}>
              <View style={globalStyles.grimoireProgressHeader}>
                <Icon name="compass" size={12} color={theme.statusInfo} />
                <Text style={[globalStyles.grimoireProgressLabel, { color: theme.statusInfo }]}>Exploration: {grimoire.exploration}%</Text>
              </View>
              <View style={globalStyles.grimoireProgressBar}>
                <LinearGradient
                  colors={[theme.statusInfo, theme.rarityEpic]}
                  style={[globalStyles.grimoireProgressFill, { width: `${grimoire.exploration}%` }]}
                />
              </View>
            </View>
          )}

          {/* Description */}
          <Text style={[globalStyles.grimoireDescription, { color: theme.archiveSubtext }]}>{grimoire.description}</Text>
          
          {/* Atmosphere */}
          <View style={globalStyles.grimoireAtmosphereContainer}>
            <Icon name="eye" size={10} color={theme.statusInfo} />
            <Text style={[globalStyles.grimoireAtmosphereText, { color: theme.statusInfo }]}>✦ {grimoire.atmosphere} ✦</Text>
          </View>

          {/* Skill Focus Tags */}
          <View style={globalStyles.grimoireSkillFocusContainer}>
            <Text style={[globalStyles.grimoireSkillFocusLabel, { color: theme.archiveSubtext }]}>Coping Skills:</Text>
            <View style={globalStyles.grimoireSkillTags}>
              {grimoire.skillFocus.slice(0, 2).map((skill, index) => (
                <View key={index} style={globalStyles.grimoireSkillTag}>
                  <Text style={globalStyles.grimoireSkillTagText}>{skill}</Text>
                </View>
              ))}
              {grimoire.skillFocus.length > 2 && (
                <View style={globalStyles.grimoireSkillTag}>
                  <Text style={globalStyles.grimoireSkillTagText}>+{grimoire.skillFocus.length - 2}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stat Boosts */}
          <View style={globalStyles.grimoireStatBoostsContainer}>
            <Text style={[globalStyles.grimoireStatBoostsLabel, { color: theme.archiveSubtext }]}>Strengthens:</Text>
            <View style={globalStyles.grimoireStatBoostTags}>
              {grimoire.statBoosts.map((stat, index) => (
                <View key={index} style={globalStyles.grimoireStatBoostTag}>
                  <Icon name="trending-up" size={8} color={theme.statusSuccess} />
                  <Text style={[globalStyles.grimoireStatBoostText, { color: theme.statusSuccess }]}>{stat}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Footer Info */}
          <View style={globalStyles.grimoireFooter}>
            <View style={globalStyles.grimoireFooterStat}>
              <Icon name="clock" size={12} color={theme.statusWarning} />
              <Text style={[globalStyles.grimoireFooterStatText, { color: theme.archiveSubtext }]}>{grimoire.timeToComplete}</Text>
            </View>
            <View style={globalStyles.grimoireFooterStat}>
              <Icon name="key" size={12} color={theme.archiveAccent} />
              <Text style={[globalStyles.grimoireFooterStatText, { color: theme.archiveSubtext }]}>{grimoire.revelations} revelations</Text>
            </View>
            <View style={globalStyles.grimoireFooterStat}>
              <Icon name="zap" size={12} color={theme.rarityEpic} />
              <Text style={[globalStyles.grimoireFooterStatText, { color: theme.archiveSubtext }]}>{grimoire.difficulty}</Text>
            </View>
          </View>

          {/* Action Button */}
          {!grimoire.isLocked && (
            <View style={globalStyles.grimoireActionButton}>
              <LinearGradient
                colors={[theme.primary, theme.rarityEpic]}
                style={globalStyles.grimoireActionButtonGradient}
              >
                <Icon name="book-open" size={14} color="#E0E7FF" />
                <Text style={globalStyles.grimoireActionButtonText}>
                  {grimoire.exploration > 0 ? 'Continue Study' : 'Begin Reading'}
                </Text>
              </LinearGradient>
            </View>
          )}
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={globalStyles.grimoireModalOverlay}>
        <LinearGradient
          colors={[theme.archiveGradientStart, theme.archiveGradientMiddle, theme.archiveGradientEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        
        <View style={globalStyles.grimoireModalContent}>
          <LinearGradient
            colors={[theme.archiveGradientStart, theme.archiveGradientMiddle, theme.archiveGradientEnd]}
            style={[globalStyles.grimoireModalGradient, { borderColor: theme.archiveBorder }]}
          >
            <BlurView intensity={20} style={globalStyles.grimoireModalBlur}>
              
              {/* Header */}
              <View style={[globalStyles.grimoireModalHeader, { borderBottomColor: theme.archiveBorder }]}>
                <View style={globalStyles.grimoireHeaderContent}>
                  <Icon name="book" size={24} color={theme.archiveAccent} />
                  <Text style={[globalStyles.grimoireModalTitle, { color: theme.archiveAccent }]}>Archive of Grimoires</Text>
                  <TouchableOpacity style={globalStyles.grimoireCloseButton} onPress={onClose}>
                    <LinearGradient
                      colors={['rgba(239, 68, 68, 0.8)', 'rgba(220, 38, 38, 0.8)']}
                      style={globalStyles.grimoireCloseButtonGradient}
                    >
                      <Icon name="x" size={18} color="#FECACA" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                <Text style={[globalStyles.grimoireModalSubtitle, { color: theme.archiveSubtext }]}>
                  Ancient grimoires of wisdom await your study. Each grimoire contains powerful coping techniques disguised as mystical knowledge.
                </Text>
              </View>

              {/* Grimoire Grid */}
              <ScrollView 
                style={globalStyles.grimoireScrollView}
                contentContainerStyle={globalStyles.grimoireGrid}
                showsVerticalScrollIndicator={false}
              >
                {availableGrimoires.map(grimoire => (
                  <GrimoireCard key={grimoire.id} grimoire={grimoire} />
                ))}
              </ScrollView>
              
            </BlurView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

export default GrimoireCatalogModal;
/**
 * Character Home Screen Styles
 * Comprehensive styles for the main character home/archive screen
 *
 * Sections:
 * - Base containers and layouts
 * - Header and navigation tabs
 * - Character display and frame
 * - Experience and level progress
 * - Gear slots system
 * - Foundations section
 * - Story/Chronicle cards
 * - Action buttons
 * - Codex section
 * - Mind Defender section
 * - Progress indicators
 */

import { TextStyle, ViewStyle } from 'react-native';
import { BORDER_RADIUS, FONT_FAMILIES, SCREEN_DIMENSIONS, SPACING, engravedText } from '../foundation';
import { ThemeColors, characterHomeScreenTheme } from '../theme';

const { width, height } = SCREEN_DIMENSIONS;

export type CharacterHomeStyles = ReturnType<typeof createCharacterHomeStyles>;

/**
 * Creates character home screen styles
 */
export const createCharacterHomeStyles = (theme: ThemeColors = characterHomeScreenTheme) => ({
  // ==========================================
  // SECTION 1: BASE CONTAINERS & LAYOUTS
  // ==========================================

  archiveContainer: {
    flex: 1,
    backgroundColor: theme.archiveBackground || '#0a0b0f',
  } as ViewStyle,

  archiveContent: {
    flex: 1,
    paddingTop: 10,
  } as ViewStyle,

  // Alias for backward compatibility
  archivepassages: {
    flex: 1,
    paddingTop: 10,
  } as ViewStyle,

  archiveTabContentArea: {
    paddingBottom: SPACING.lg,
  } as ViewStyle,

  archiveTabpassagesArea: {
    flex: 1,
    paddingBottom: SPACING.lg,
    backgroundColor: 'transparent', // Ensure transparency
  } as ViewStyle,

  atmosphericOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  } as ViewStyle,

  // ==========================================
  // SECTION 2: HEADER & NAVIGATION
  // ==========================================

  archiveHeader: {
    padding: 10,
    paddingTop: 10,
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: theme.archiveBorder || '#8d7527ff',
  } as ViewStyle,

  archiveHeaderGradient: {
    width: '95%',
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginLeft: 8,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderColor: '#8d7527ff',
    borderWidth: 2,
  } as ViewStyle,

  archiveHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: 'transparent',
  } as ViewStyle,

  // Alias for backward compatibility
  archiveHeaderpassages: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: 'transparent',
  } as ViewStyle,

  archiveHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.lg,
  } as ViewStyle,

  archiveHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
    overflow: 'hidden',
  } as ViewStyle,

  archiveHeaderIconOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(255, 224, 102, 0.8)',
    borderRadius: 8,
    padding: 2,
    zIndex: 2,
  } as ViewStyle,

  archiveHeaderTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 2,
  } as ViewStyle,

  archiveHeaderTitle: {
    color: '#4ee6e6',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    textShadowColor: 'rgba(78, 230, 230, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  } as TextStyle,

  archiveHeaderSubtitle: {
    color: '#d4af37',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 4,
  } as TextStyle,

  archiveStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  } as ViewStyle,

  archiveStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
    backgroundColor: '#4ee6e6',
  } as ViewStyle,

  archiveStatusText: {
    color: '#365f5fff',
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.8,
  } as TextStyle,

  archiveTitle: {
    fontFamily: FONT_FAMILIES.TITLE,
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.archiveAccent || '#c89f65',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    letterSpacing: 1,
    ...engravedText,
  } as TextStyle,

  // Tab Navigation
  archiveTabContainer: {
    width: '96%',
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
    backgroundColor: 'transparent',
  } as ViewStyle,

  archiveTabGradient: {
    width: '100%',
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 2,
  } as ViewStyle,

  archiveTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.lg,
    backgroundColor: 'transparent',
  } as ViewStyle,

  // Alias for backward compatibility
  archiveTabpassages: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.lg,
    backgroundColor: 'transparent',
  } as ViewStyle,

  archiveTabScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    gap: 4,
  } as ViewStyle,

  // Alias for backward compatibility
  archiveTabScrollpassages: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    gap: 4,
  } as ViewStyle,

  archiveTabContentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.lg,
    paddingTop: 0,
    paddingBottom: 0,
  } as ViewStyle,

  // Alias for backward compatibility
  archiveTabpassagesContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.lg,
    paddingTop: 0,
    paddingBottom: 0,
  } as ViewStyle,

  tabContentArea: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  } as ViewStyle,

  // Alias for backward compatibility
  tabpassagesArea: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  } as ViewStyle,

  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: BORDER_RADIUS.small,
    overflow: 'hidden',
    minWidth: 120,
  } as ViewStyle,

  activeTab: {
    backgroundColor: 'rgba(217, 119, 6, 0.3)',
  } as ViewStyle,

  tabText: {
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'center',
    marginLeft: 4,
  } as TextStyle,

  tabTextActive: {
    fontWeight: '700',
    textShadowColor: theme.tabTextShadowColor || 'rgba(78, 230, 230, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,

  tabTextInactive: {
    fontWeight: 'bold',
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,

  // Avatar showcase header
  avatarShowcaseHeader: {
    width: '100%',
    borderRadius: width < 768 ? SPACING.lg : 24,
    overflow: 'hidden',
    marginBottom: width < 768 ? 6 : 12,
    backgroundColor: 'transparent',
  } as ViewStyle,

  // ==========================================
  // SECTION 3: CHARACTER DISPLAY & FRAME
  // ==========================================

  centralCharacterDisplay: {
    alignItems: 'center',
    marginHorizontal: 0,
    paddingHorizontal: 0,
    flex: 1,
    minWidth: 0,
    maxWidth: width < 768 ? 220 : 220,
  } as ViewStyle,

  characterDisplaySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: width < 768 ? 4 : 8,
    paddingHorizontal: 0,
    maxWidth: "100%",
    overflow: 'visible',
    minHeight: width < 768 ? width * 0.35 : width * 0.5,
    flex: 1,
  } as ViewStyle,

  characterFrame: {
    width: Math.min(width * 0.35, width < 768 ? 180 : 200),
    height: Math.min(width * 0.35, width < 768 ? 180 : 200),
    borderRadius: width < 768 ? SPACING.lg : 18,
    padding: 2,
    marginBottom: width < 768 ? 4 : 10,
    maxWidth: width < 768 ? 180 : 200,
    minWidth: width < 768 ? 120 : 150,
    alignSelf: 'center',
  } as ViewStyle,

  characterFrameInner: {
    flex: 1,
    borderRadius: 17,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  characterLevelBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    overflow: 'hidden',
  } as ViewStyle,

  levelBadgeGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  } as ViewStyle,

  levelBadgeText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: 'bold',
  } as TextStyle,

  characterMoodBubble: {
    bottom: -10,
    left: '25%',
    transform: [{ translateX: 10 }],
    width: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 6,
  } as ViewStyle,

  moodBubbleGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderWidth: 2,
    borderColor: '#D97706',
  } as ViewStyle,

  moodBubbleText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  } as TextStyle,

  // ==========================================
  // SECTION 4: CHARACTER INFO & STATS
  // ==========================================

  characterInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width < 768 ? 12 : 20,
    paddingVertical: width < 768 ? 8 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 119, 6, 0.2)',
  } as ViewStyle,

  characterDetails: {
    alignItems: 'flex-start',
  } as ViewStyle,

  characterRarity: {
    color: '#4ee6e6',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,

  characterClass: {
    color: '#d4af37',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  } as TextStyle,

  characterName: {
    color: '#4ee6e6',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    textShadowColor: 'rgba(78, 230, 230, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,

  // Level and Experience Display
  levelDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  } as ViewStyle,

  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  } as TextStyle,

  experienceBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  } as ViewStyle,

  experienceFill: {
    height: '100%',
    borderRadius: 4,
  } as ViewStyle,

  experienceText: {
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,

  experienceProgressContainer: {
    marginBottom: width < 768 ? 4 : 8,
    borderRadius: BORDER_RADIUS.small,
    overflow: 'hidden',
    marginHorizontal: width < 768 ? 6 : 10,
  } as ViewStyle,

  experienceProgressGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  } as ViewStyle,

  experienceProgressText: {
    color: '#0a0b0f',
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,

  // Wellness Stats
  wellnessStats: {
    marginTop: SPACING.sm,
  } as ViewStyle,

  wellnessLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  } as TextStyle,

  wellnessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  } as ViewStyle,

  wellnessStat: {
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 4,
    marginVertical: 2,
  } as TextStyle,

  archiveText: {
    color: theme.archiveText || '#ffffff',
    fontSize: 14,
  } as TextStyle,

  // ==========================================
  // SECTION 5: GEAR SLOTS SYSTEM
  // ==========================================

  gearColumn: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: width < 768 ? 12 : 16,
    width: width < 768 ? 60 : 70,
    height: width < 768 ? 120 : 140,
    top: '50%',
    transform: [{ translateY: -40 }],
  } as ViewStyle,

  gearColumnLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: width < 768 ? 12 : 16,
    width: width < 768 ? 60 : 70,
    height: width < 768 ? 120 : 140,
    left: width < 768 ? 40 : 60,
    marginRight: 10,
    marginTop: -20,
  } as ViewStyle,

  gearColumnRight: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: width < 768 ? 2 : 4,
    width: width < 768 ? 60 : 70,
    height: width < 768 ? 120 : 140,
    right: width < 768 ? 40 : 60,
    marginLeft: 10,
    marginTop: -20,
  } as ViewStyle,

  gearSlot: {
    width: '100%',
    height: width < 768 ? 50 : 55,
    borderRadius: 8,
    overflow: 'hidden',
  } as ViewStyle,

  gearSlotGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  } as ViewStyle,

  emptyGearSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    height: '80%',
  } as ViewStyle,

  equippedGearSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 8,
  } as ViewStyle,

  gearSlotIcon: {
    fontSize: width < 768 ? 14 : 16,
    marginBottom: 1,
  } as TextStyle,

  gearSlotLabel: {
    color: '#9CA3AF',
    fontSize: width < 768 ? 6 : 7,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: width < 768 ? 8 : 9,
  } as TextStyle,

  gearSlotLockedText: {
    color: '#6B7280',
    fontSize: 8,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 2,
  } as TextStyle,

  // ==========================================
  // SECTION 6: FOUNDATIONS SECTION
  // ==========================================

  foundationsSection: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
  } as ViewStyle,

  foundationsSectionGradient: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#d4af37',
  } as ViewStyle,

  foundationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  } as ViewStyle,

  foundationsTitle: {
    color: '#4ee6e6',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
    textAlign: 'center',
  } as TextStyle,

  foundationsSubtitle: {
    fontSize: 14,
    color: '#d4af37',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  } as TextStyle,

  foundationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  } as ViewStyle,

  foundationCard: {
    width: '48%',
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  } as ViewStyle,

  foundationCardGradient: {
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.2)',
    minHeight: 140,
  } as ViewStyle,

  foundationIconContainer: {
    position: 'relative',
    marginBottom: 8,
  } as ViewStyle,

  foundationIcon: {
    fontSize: 24,
    marginBottom: 0,
  } as TextStyle,

  foundationValueContainer: {
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  foundationValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ee6e6',
    marginBottom: 2,
  } as TextStyle,

  foundationMaxValue: {
    fontSize: 14,
    color: '#d4af37',
  } as TextStyle,

  foundationLevel: {
    fontSize: 10,
    color: '#06B6D4',
    fontWeight: '600',
  } as TextStyle,

  foundationProgressContainer: {
    width: '100%',
    marginBottom: 6,
  } as ViewStyle,

  foundationProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
    position: 'relative',
  } as ViewStyle,

  foundationProgressFill: {
    height: '100%',
    borderRadius: 4,
  } as ViewStyle,

  foundationLabel: {
    fontSize: 12,
    color: '#4ee6e6',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  } as TextStyle,

  foundationDescription: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  } as TextStyle,

  xpToNext: {
    fontSize: 9,
    color: '#FCD34D',
    textAlign: 'center',
    fontWeight: '500',
  } as TextStyle,

  recentGainBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    overflow: 'hidden',
  } as ViewStyle,

  recentGainGradient: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  } as ViewStyle,

  recentGainText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  } as TextStyle,

  nextUnlockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  } as ViewStyle,

  nextUnlockText: {
    fontSize: 9,
    color: '#FCD34D',
    textAlign: 'center',
    fontStyle: 'italic',
  } as TextStyle,

  // ==========================================
  // SECTION 7: ACTION BUTTONS
  // ==========================================

  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    flex: 1,
    marginRight: 4,
  } as ViewStyle,

  restartButtonText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,

  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    flex: 1,
    marginLeft: 4,
  } as ViewStyle,

  debugButtonText: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,
});

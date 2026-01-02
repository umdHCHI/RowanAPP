/**
 * Story Component Theme Constants
 * Centralized colors, spacing, typography, and style values for story components
 */

export const STORY_COLORS = {
  // Background colors
  background: '#B8C5D1',
  endingBackground: '#2D1B4E',
  introductionBackground: '#3d5a80',
  
  // Text colors
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  textTertiary: 'rgba(255, 255, 255, 0.7)',
  
  // UI element colors
  button: '#6B7A8A',
  buttonSecondary: '#4A5D6B',
  buttonBorder: 'rgba(255, 255, 255, 0.3)',
  
  // Container colors
  dialogueBubble: 'rgba(255, 255, 255, 0.2)',
  playerChoiceBubble: 'rgba(107, 122, 138, 0.4)',
  decisionContainer: 'rgba(107, 122, 138, 0.3)',
  decisionBorder: 'rgba(255, 255, 255, 0.5)',
  decisionLabel: 'rgba(255, 255, 255, 0.9)',
  decisionSubtext: 'rgba(255, 255, 255, 0.7)',
  actionContainer: 'rgba(255, 255, 255, 0.08)',
  actionBorder: 'rgba(255, 200, 87, 0.8)',
  actionIndicator: 'rgba(255, 200, 87, 1)',
  endingContainer: 'rgba(0, 0, 0, 0.3)',
  endingBorder: 'rgba(255, 255, 255, 0.3)',
  quoteContainer: 'rgba(0, 0, 0, 0.2)',
  quoteBorder: 'rgba(255, 255, 255, 0.5)',
  errorContainer: 'rgba(244, 67, 54, 0.2)',
  
  // Overlay colors
  pauseOverlay: 'rgba(0, 0, 0, 0.2)',
  pauseButton: 'rgba(255, 255, 255, 0.2)',
  pauseBorder: 'rgba(255, 255, 255, 0.5)',
  headerBorder: 'rgba(255, 255, 255, 0.1)',
  
  // Avatar/border colors
  avatarBorder: 'rgba(255, 255, 255, 0.3)',
  speck: '#ffffff',
} as const

export const STORY_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

export const STORY_BORDER_RADIUS = {
  sm: 4,
  md: 12,
  lg: 16,
  xl: 18,
  full: 60,
} as const

export const STORY_FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 42,
} as const

export const STORY_LINE_HEIGHTS = {
  sm: 22,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 48,
} as const

export const STORY_FONTS = {
  system: 'System',
  vt323: 'VT323-Regular',
  crimsonItalic: 'CrimsonPro-Medium-Italic',
  beyondWonderland: 'BeyondWonderland',
  fontTitleWhite: 'FontTitle-White',
} as const

export const STORY_LAYOUT = {
  headerTop: 50,
  headerButtonSize: 40,
  headerZIndex: 10,
  pauseOverlayZIndex: 20,
  pauseButtonSize: 120,
  pauseIconSize: 80,
  speakerAvatarSize: 48,
  choicesContainerMinHeight: 400,
  choicesContainerMaxHeightPercent: 0.5,
  mainContainerPaddingTop: 50,
} as const

export const STORY_OPACITY = {
  speck: {
    min: 0.3,
    max: 0.7,
  },
  buttonActive: 0.7,
  buttonTouch: 0.8,
  pauseOverlay: 0.9,
} as const

export const STORY_SPECKS = {
  count: 30,
  size: 2,
  seedMultiplier: 7919,
  distributionRatio: 0.618,
  topRatio: 0.382,
  opacityRatio: 0.123,
} as const


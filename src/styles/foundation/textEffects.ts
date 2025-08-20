import { TextStyle } from 'react-native';
import { ThemeColors } from '../theme';

/**
 * Creates engraved text effect for RPG aesthetic
 */
export const engravedText: TextStyle = {
  textShadowColor: 'rgba(0, 0, 0, 0.4)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 1,
};

/**
 * Creates glowing text effect using theme accent color
 */
export const glowingText = (theme: ThemeColors): TextStyle => ({
  textShadowColor: theme.archiveAccent || '#4ee6e6',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 8,
});

/**
 * Standard text shadows for different effects
 */
export const standardTextShadows = {
  engraved: {
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  raised: {
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: -1 },
    textShadowRadius: 1,
  },
  glow: (color: string = '#4ee6e6') => ({
    textShadowColor: color,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  }),
  mystic: {
    textShadowColor: 'rgba(212, 175, 55, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
} as const;

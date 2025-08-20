import { TextStyle, ViewStyle } from 'react-native';
import { standardShadows } from '../foundation';
import { ThemeColors } from '../theme';

/**
 * Button component styles following RPG aesthetic
 */
export const createButtonStyles = (theme: ThemeColors) => ({
  // Primary buttons
  buttonPrimary: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 200,
    ...standardShadows.button,
  } as ViewStyle,
  
  buttonPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  } as ViewStyle,
  
  buttonPrimaryText: {
    color: '#E0E7FF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  } as TextStyle,
  
  // Secondary buttons
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.archiveSubtext || '#888',
    ...standardShadows.subtle,
  } as ViewStyle,
  
  buttonSecondaryText: {
    color: theme.archiveSubtext || '#888',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  } as TextStyle,
  
  // Small buttons
  buttonSmall: {
    borderRadius: 8,
    overflow: 'hidden',
  } as ViewStyle,
  
  buttonSmallGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  } as ViewStyle,
  
  buttonSmallText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    color: '#E0E7FF',
  } as TextStyle,
  
  // Interactive buttons
  buttonInteractive: {
    borderRadius: 8,
    overflow: 'hidden',
  } as ViewStyle,
  
  buttonInteractiveGradient: (accentColor: string) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: accentColor,
  } as ViewStyle),
  
  buttonInteractiveText: (color: string) => ({
    color: color,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  } as TextStyle),
  
  // Disabled state
  buttonDisabled: {
    opacity: 0.5,
  } as ViewStyle,
  
  // Enter/Action buttons
  enterButton: {
    position: 'relative',
    backgroundColor: theme.primary || '#4338ca',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    ...standardShadows.button,
    marginTop: 10,
  } as ViewStyle,
  
  enterButtonDisabled: {
    opacity: 0.7,
  } as ViewStyle,
  
  enterButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,
});

export type ButtonStyles = ReturnType<typeof createButtonStyles>;

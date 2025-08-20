import { TextStyle, ViewStyle } from 'react-native';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING, standardShadows } from '../foundation';
import { ThemeColors } from '../theme';

/**
 * Character Creator screen styles - example of how to refactor remaining screens
 * This shows the pattern for extracting and modularizing screen-specific styles
 */
export const createCharacterCreatorStyles = (theme: ThemeColors) => ({
  // Main containers
  container: {
    flex: 1,
    backgroundColor: theme.background || '#0a0b0f',
  } as ViewStyle,

  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  } as ViewStyle,

  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  } as ViewStyle,

  floatingIcon: {
    position: 'absolute',
    fontSize: FONT_SIZES.xxl,
    color: theme.archiveAccent || '#4ee6e6',
    opacity: 0.3,
  } as TextStyle,

  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 11, 15, 0.8)',
  } as ViewStyle,

  scrollContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  } as ViewStyle,

  // Header section
  header: {
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: SPACING.xxxl - 2,
  } as ViewStyle,

  forgeTitle: {
    color: theme.archiveAccent || '#4ee6e6',
    fontSize: 28,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 3,
    marginBottom: SPACING.sm,
  } as TextStyle,

  forgeSubtitle: {
    color: theme.archiveAccentSecondary || '#d4af37',
    fontSize: FONT_SIZES.md,
    fontStyle: 'italic',
    marginBottom: 15,
  } as TextStyle,

  decorativeLine: {
    width: 80,
    height: 2,
    backgroundColor: theme.archiveAccent || '#4ee6e6',
    opacity: 0.8,
  } as ViewStyle,

  // Name section
  nameSection: {
    backgroundColor: `rgba(78, 230, 230, 0.1)`,
    borderRadius: BORDER_RADIUS.xlarge,
    padding: SPACING.xl,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: theme.archiveAccent || '#4ee6e6',
    ...standardShadows.card,
  } as ViewStyle,

  nameLabel: {
    color: theme.archiveAccent || '#4ee6e6',
    fontSize: 28,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  } as TextStyle,

  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.large,
    borderWidth: 2,
    borderColor: theme.archiveAccent || '#4ee6e6',
    padding: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    color: theme.archiveText || '#ffffff',
    textAlign: 'center',
    fontWeight: FONT_WEIGHTS.semibold,
  } as ViewStyle & TextStyle,

  // Character customization sections would go here
  // customizationSection: { ... },
  // appearanceOptions: { ... },
  // etc.

  // Action buttons
  actionContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  } as ViewStyle,

  createButton: {
    backgroundColor: theme.archiveAccent || '#4ee6e6',
    borderRadius: BORDER_RADIUS.large,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxxl,
    ...standardShadows.button,
  } as ViewStyle,

  createButtonText: {
    color: '#0a0b0f',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  } as TextStyle,

  backButton: {
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 2,
    borderColor: theme.archiveAccentSecondary || '#d4af37',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
  } as ViewStyle,

  backButtonText: {
    color: theme.archiveAccentSecondary || '#d4af37',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  } as TextStyle,
});

export type CharacterCreatorStyles = ReturnType<typeof createCharacterCreatorStyles>;

/**
 * Usage example:
 * 
 * import { createCharacterCreatorStyles } from '../../styles/screens/characterCreator';
 * 
 * const CharacterCreatorScreen = () => {
 *   const theme = useTheme();
 *   const styles = createCharacterCreatorStyles(theme);
 *   
 *   return (
 *     <View style={styles.container}>
 *       <View style={styles.header}>
 *         <Text style={styles.forgeTitle}>Character Forge</Text>
 *         <Text style={styles.forgeSubtitle}>Craft Your Legend</Text>
 *       </View>
 *       // ... rest of component
 *     </View>
 *   );
 * };
 */

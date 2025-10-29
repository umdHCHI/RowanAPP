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
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 15,
    textAlign: 'center',
    marginTop: 10,
  } as ViewStyle & TextStyle,

  nameInputFocused: {
    backgroundColor: 'rgba(78, 230, 230, 0.2)',
    borderColor: '#4ee6e6',
    shadowColor: '#4ee6e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  } as ViewStyle,

  // Section Titles
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  } as TextStyle,

  // Preview Section
  previewSection: {
    backgroundColor: 'rgba(157, 78, 221, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#9d4edd',
  } as ViewStyle,

  previewContainer: {
    alignItems: 'center',
  } as ViewStyle,

  // Main Content Area (used in alternative layouts)
  characterCreatorMainpassages: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
  } as ViewStyle,

  // Preview Section (component-specific)
  characterCreatorPreviewSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 8,
    minHeight: 200,
    maxHeight: 250,
  } as ViewStyle,

  // Style Section
  styleSection: {
    backgroundColor: 'rgba(247, 37, 133, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#f72585',
  } as ViewStyle,

  // Custom Two-Row Grid Layout
  categoryGrid: {
    marginBottom: 5,
  } as ViewStyle,

  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  } as ViewStyle,

  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 60,
    alignItems: 'center',
  } as ViewStyle,

  selectedCategoryButton: {
    backgroundColor: 'rgba(78, 230, 230, 0.2)',
    borderColor: '#4ee6e6',
    borderWidth: 1,
  } as ViewStyle,

  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  } as TextStyle,

  selectedCategoryText: {
    color: '#4ee6e6',
  } as TextStyle,

  // Single Color Section
  colorSection: {
    backgroundColor: 'rgba(255, 214, 10, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#ffd60a',
    alignItems: 'center',
  } as ViewStyle,

  // Color Section (alternative layout)
  characterCreatorColorSection: {
    flex: 1,
    paddingLeft: 8,
    justifyContent: 'center',
  } as ViewStyle,

  characterCreatorColorContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.archiveBorder || '#333',
  } as ViewStyle,

  characterCreatorColorOptionsContainer: {
    backgroundColor: theme.archiveMode === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(243, 244, 246, 0.5)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.archiveBorder || '#333',
    maxHeight: 300,
  } as ViewStyle,

  // Style and Color Option Controls
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 15,
  } as ViewStyle,

  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 12,
    minWidth: 60,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  } as ViewStyle,

  selectedOptionButton: {
    backgroundColor: 'rgba(78, 230, 230, 0.3)',
    borderColor: '#4ee6e6',
    shadowColor: '#4ee6e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  } as ViewStyle,

  optionImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  } as ViewStyle,

  optionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  } as TextStyle,

  selectedOptionText: {
    color: '#4ee6e6',
  } as TextStyle,

  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'transparent',
    marginHorizontal: 5,
    marginVertical: 5,
  } as ViewStyle,

  selectedColorButton: {
    borderColor: '#4ee6e6',
    shadowColor: '#4ee6e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  } as ViewStyle,

  // Character Creator Component Styles (for StyleControls and ColorOptionControls)
  characterCreatorHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  } as ViewStyle,

  characterCreatorNameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ee6e6',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 15,
    textAlign: 'center',
    marginTop: 10,
  } as ViewStyle & TextStyle,

  characterCreatorStyleSelectorContainer: {
    marginVertical: 20,
    alignItems: 'center',
  } as ViewStyle,

  characterCreatorStyleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 250,
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  } as ViewStyle,

  characterCreatorArrowButton: {
    backgroundColor: '#4ee6e6',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  } as ViewStyle,

  characterCreatorArrowText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  } as TextStyle,

  characterCreatorOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    minWidth: 80,
    textAlign: 'center',
  } as TextStyle,

  // Color Controls Styles
  characterCreatorColorCategory: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.3)',
  } as ViewStyle,

  characterCreatorColorCategoryLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,

  characterCreatorColorControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  } as ViewStyle,

  characterCreatorColorArrowButton: {
    backgroundColor: '#4ee6e6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  } as ViewStyle,

  characterCreatorColorOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'center',
  } as TextStyle,

  characterCreatorColorArrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  } as TextStyle,

  characterCreatorSkinSelectorBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
    zIndex: 0,
  } as ViewStyle,

  characterCreatorSectionTitle: {
    color: theme.archiveText || '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,

  characterCreatorBottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: theme.archiveMode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
    borderTopColor: theme.archiveBorder || '#333',
  } as ViewStyle,

  characterCreatorStyleCategoryContainer: {
    marginBottom: 16,
  } as ViewStyle,

  characterCreatorCategoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    backgroundColor: theme.archiveMode === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.archiveBorder || '#333',
  } as ViewStyle,

  characterCreatorSelectedCategoryButton: {
    backgroundColor: theme.archiveAccent || '#4ee6e6',
    borderColor: theme.archiveAccent || '#4ee6e6',
  } as ViewStyle,

  characterCreatorCategoryText: {
    color: theme.archiveText || '#fff',
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,

  characterCreatorSelectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  } as TextStyle,

  characterCreatorSkinSelectorContainer: {
    width: 360,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    backgroundColor: theme.archiveMode === 'dark' ? 'rgba(51, 65, 85, 0.3)' : 'rgba(243, 244, 246, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.archiveBorder || '#333',
  } as ViewStyle,

  characterCreatorSkinGrid: {
    flexDirection: 'row',
    width: 360,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  } as ViewStyle,

  characterCreatorSkinColumn: {
    flexDirection: 'column',
  } as ViewStyle,

  characterCreatorSkinOption: {
    margin: 2,
    borderRadius: 4,
    overflow: 'hidden',
  } as ViewStyle,

  characterCreatorSelectedSkinOption: {
    borderWidth: 2,
    borderColor: theme.archiveAccent || '#4ee6e6',
  } as ViewStyle,

  // Complete Section
  completeSection: {
    marginBottom: 40,
  } as ViewStyle,

  completeButton: {
    backgroundColor: '#4ee6e6',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#4ee6e6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,

  completeButtonText: {
    color: '#0a0b0f',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,

  // Legacy action buttons (for backward compatibility)
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

  // Additional backward compatibility
  backgroundColor: '#0a0b0f',
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

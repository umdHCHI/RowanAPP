import { TextStyle, ViewStyle } from 'react-native';
import { BORDER_RADIUS, SPACING, standardShadows } from '../foundation';
import { ThemeColors } from '../theme';

/**
 * Layout component styles for consistent spacing and structure
 */
export const createLayoutStyles = (theme: ThemeColors) => ({
  // Grid layouts
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  } as ViewStyle,
  
  gridTwoColumn: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  } as ViewStyle,
  
  gridColumn: {
    flex: 1,
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
  } as ViewStyle,
  
  // Flex layouts
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  flexColumn: {
    flexDirection: 'column',
  } as ViewStyle,
  
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  flexBetween: {
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  
  flexAround: {
    justifyContent: 'space-around',
    alignItems: 'center',
  } as ViewStyle,
  
  // Centered layouts
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  centeredMessage: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: BORDER_RADIUS.large,
    borderWidth: 1,
    borderColor: theme.archiveBorder || 'rgba(217, 119, 6, 0.2)',
    ...standardShadows.card,
  } as ViewStyle,
  
  // Section layouts
  section: {
    marginBottom: SPACING.xxl,
  } as ViewStyle,
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  } as ViewStyle,
  
  sectionContent: {
    padding: SPACING.lg,
  } as ViewStyle,
  
  // Container layouts
  container: {
    flex: 1,
    padding: SPACING.lg,
  } as ViewStyle,
  
  containerWithBackground: {
    flex: 1,
    backgroundColor: theme.background || 'rgba(15, 10, 20, 0.98)',
  } as ViewStyle,
  
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.lg,
  } as ViewStyle,
  
  // Modal layouts
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  } as ViewStyle,
  
  modalContent: {
    backgroundColor: theme.archiveCard || 'rgba(40, 25, 15, 0.98)',
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.xl,
    maxWidth: '90%',
    maxHeight: '80%',
    ...standardShadows.modal,
  } as ViewStyle,
});

/**
 * Interactive component styles for touchable elements
 */
export const createInteractiveStyles = (theme: ThemeColors) => ({
  // Touchable elements
  touchable: {
    // Note: activeOpacity is not a style property, it's a TouchableOpacity prop
  } as ViewStyle,
  
  touchableCard: {
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
  } as ViewStyle,
  
  // Interactive indicators
  interactiveIndicator: (color: string) => ({
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: color,
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle),
  
  // Hover effects (for web)
  hoverEffect: {
    transform: [{ scale: 1.02 }],
  } as ViewStyle,
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  } as ViewStyle,
  
  // Disabled states
  disabledState: {
    opacity: 0.5,
  } as ViewStyle,
});

/**
 * Form component styles
 */
export const createFormStyles = (theme: ThemeColors) => ({
  // Form containers
  formContainer: {
    gap: SPACING.xl,
  } as ViewStyle,
  
  formSection: {
    marginBottom: SPACING.lg,
  } as ViewStyle,
  
  // Input styles
  inputContainer: {
    marginBottom: SPACING.xs,
  } as ViewStyle,
  
  inputLabel: {
    color: theme.archiveText || '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  } as TextStyle,
  
  mysticalInput: {
    backgroundColor: theme.archiveCard || 'rgba(40, 25, 15, 0.5)',
    borderRadius: SPACING.sm,
    padding: 15,
    fontSize: 16,
    color: theme.archiveText || '#ffffff',
    borderWidth: 2,
    borderColor: theme.archiveBorder || 'rgba(217, 119, 6, 0.2)',
    ...standardShadows.subtle,
  } as ViewStyle & TextStyle,
  
  inputFocused: {
    borderColor: theme.archiveAccent || '#4ee6e6',
  } as ViewStyle,
  
  inputError: {
    borderColor: theme.statusError || '#ef4444',
  } as ViewStyle,
  
  // Error containers
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: SPACING.sm,
  } as ViewStyle,
  
  errorIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
    color: theme.statusError || '#ef4444',
  } as TextStyle,
  
  errorText: {
    color: theme.statusError || '#ef4444',
    fontSize: 14,
    flex: 1,
  } as TextStyle,
});

export type LayoutStyles = ReturnType<typeof createLayoutStyles>;
export type InteractiveStyles = ReturnType<typeof createInteractiveStyles>;
export type FormStyles = ReturnType<typeof createFormStyles>;

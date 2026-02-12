import { StyleSheet } from "react-native"
import { colors } from "@/theme/design-tokens"


export const crisisHelpStyles = StyleSheet.create({
    screen: {
      flex: 1,
      position: 'relative',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    resourcesContainer: {
      gap: 20,
      marginBottom: 32,
    },
    resourceCard: {
      backgroundColor: colors.crisisHelp.cardBackground,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.crisisHelp.cardBorder,
    },
    resourceActions: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      gap: 12,
      justifyContent: 'center',
    },
    actionButton: {
      flexDirection: 'row',
      flexShrink: 0,
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.crisisHelp.actionButtonBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.crisisHelp.actionButtonBorder,
    },
    buttonContainer: {
      alignItems: 'center',
      marginTop: 24,
    },
  })
  
  
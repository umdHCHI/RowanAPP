import { StyleSheet } from "react-native"

export const characterCreatorStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    scrollView: {
      flex: 1,
      zIndex: 10,
      backgroundColor: 'transparent',
    },
    scrollContent: {
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    cardSection: {
      marginBottom: 14,
      width: '100%',
      alignSelf: 'stretch',
    },
    textInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'System',
    },
    nameLabelRow: {
     
    },
    nameLabelSpacer: {
      height: 32,
      width: '100%',
    },

    nameInputBottom: {
      marginBottom: 24,
    },
    previewContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipContainer: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 4,
    },
    chip: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    chipSelected: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    styleControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    iconButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    indexDisplay: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      minWidth: 100,
    },
  })
  
import { StyleSheet } from 'react-native';
import { ThemeColors } from './theme';

export const createGlobalStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    screenContainer: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 16,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    text: {
      color: theme.text,
      fontSize: 16,
    },
    title: {
      color: theme.text,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    subtitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    button: {
      backgroundColor: theme.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: 8,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    input: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      color: theme.text,
      marginVertical: 8,
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.border,
      borderRadius: 3,
      width: '100%',
      marginBottom: 16,
    },
    progressBarFill: {
      height: 6,
      backgroundColor: theme.primary,
      borderRadius: 3,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      maxWidth: 350,
    },


    // Character Creator Styles
      creatorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: 500,
      marginTop: 8,
    },
      characterPreview: {
      width: 180,
      height: 320,
      marginBottom: 8,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 24,
    },
  });
}; 
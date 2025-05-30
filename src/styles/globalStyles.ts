import { StyleSheet } from 'react-native';
import { ThemeColors } from './theme';

export const createGlobalStyles = (theme: ThemeColors) => StyleSheet.create({
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
}); 
import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface CuratorNoteProps {
  children: string;
}

export const CuratorNote: React.FC<CuratorNoteProps> = ({ children }) => {
  return <Text style={styles.note}>{children}</Text>;
};

const styles = StyleSheet.create({
  note: {
    fontStyle: 'italic',
    fontSize: 12,
    color: '#c9b896',
    opacity: 0.95,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
});

export default CuratorNote;

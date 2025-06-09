import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PlaceholderIconProps {
  type: 'focus' | 'comfort' | 'shield' | 'ground';
  size?: number;
  color?: string;
}

const getIconName = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'focus':
      return 'book-outline';
    case 'comfort':
      return 'heart-outline';
    case 'shield':
      return 'shield-outline';
    case 'ground':
      return 'home-outline';
    default:
      return 'help-circle-outline';
  }
};

export const PlaceholderIcon: React.FC<PlaceholderIconProps> = ({
  type,
  size = 32,
  color = '#fff'
}) => (
  <View style={styles.container}>
    <Ionicons name={getIconName(type)} size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 
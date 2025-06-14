import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface PixelButtonProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const PixelButton: React.FC<PixelButtonProps> = ({ children, style }) => (
  <View style={[styles.outerBorder, style]}>
    <View style={styles.innerBorder}>
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  outerBorder: {
    borderWidth: 4,
    borderColor: '#3b2e1a', // dark brown
    backgroundColor: '#3b2e1a',
    borderRadius: 0, // square for pixel look
    padding: 0,
    alignSelf: 'center',
  },
  innerBorder: {
    borderWidth: 2,
    borderColor: '#ffe066', // yellow accent
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
  },
});

export default PixelButton; 
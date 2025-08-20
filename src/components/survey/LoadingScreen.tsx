import React from 'react';
import { Text, View } from 'react-native';

interface LoadingScreenProps {
  styles: any;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ styles }) => {
  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={styles.title}>Loading...</Text>
      <Text style={styles.text}>Preparing your personalized survey</Text>
    </View>
  );
};

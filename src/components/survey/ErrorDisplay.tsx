import React from 'react';
import { Text } from 'react-native';

interface ErrorDisplayProps {
  error: string;
  styles: any;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, styles }) => {
  return (
    <Text style={[
      styles.text, 
      { 
        color: styles.notification, 
        marginTop: 16 
      }
    ]}>
      {error}
    </Text>
  );
};

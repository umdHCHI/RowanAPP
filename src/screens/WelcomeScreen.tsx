import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function WelcomeScreen() {
  const { styles } = useTheme();

  return (
    <View style={[styles.screenContainer, localStyles.container]}>
      <Text style={styles.title}>Welcome to the Game!</Text>
      <Text style={[styles.text, localStyles.subtitle]}>
        Choose how you want to start your journey:
      </Text>
      <TouchableOpacity
        style={[styles.button, localStyles.button]}
        onPress={() => router.push('/personality-test')}
      >
        <Text style={styles.buttonText}>Start Personality Survey</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, localStyles.button]}
        onPress={() => router.push('/character-creator')}
      >
        <Text style={styles.buttonText}>Start Character Creator</Text>
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  button: {
    marginVertical: 10,
    minWidth: 220,
  },
}); 
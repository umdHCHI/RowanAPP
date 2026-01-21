import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, ImageBackground } from 'react-native'
import { useLogin } from '@/api/hooks/use-login'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useHaptics } from '@/utils/useHaptics'
import { usePageFlipSound } from '@/utils/usePageFlipSound'

/**
 * Login Page
 * 
 * This page demonstrates how to use the login functionality:
 * 1. User enters email and password
 * 2. Calls useLogin() hook which handles:
 *    - Calling userService.login(email, password)
 *    - Extracting user ID from response (user object included)
 *    - Storing token and user ID in auth store
 *    - Redirecting to hub
 * 
 * Backend: DRF Token Authentication
 * Format: Authorization: Token <token>
 */
export default function LoginPage() {
  const { login, isLoading, error } = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const haptics = useHaptics()
  const playPageFlipSound = usePageFlipSound()

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password')
      return
    }

    try {
      haptics.mediumImpact()
      playPageFlipSound()
      await login(email.trim(), password)
      // Navigation is handled by the useLogin hook
    } catch (error) {
      // Error is already set in the hook, but we can show it here too
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'An error occurred during login. Please try again.'
      )
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/UI/hauntedlibrary.png')}
        style={styles.backgroundContainer}
        resizeMode="cover"
      >
        <View style={styles.backgroundOverlay} />
      </ImageBackground>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>The Archive</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isLoading}
                returnKeyType="next"
              />

              <View style={styles.passwordField}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />

                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => {
                    haptics.lightImpact()
                    playPageFlipSound()
                    setIsPasswordVisible((prev) => !prev)
                  }}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
                  accessibilityState={{ disabled: isLoading }}
                  hitSlop={10}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={isPasswordVisible ? 'book-open-variant' : 'book'}
                    size={22}
                    color="#ffffffcc"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 48,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffffcc',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  passwordField: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#15111f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    padding: 16,
    paddingRight: 52,
    fontSize: 16,
    color: '#fff',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
  },
  button: {
    backgroundColor: '#15111f',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'FontTitle-White',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
})


import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLogin } from '@/api/hooks/use-login'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useHaptics } from '@/utils/useHaptics'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { GameBackground } from '@/components/ui/GameBackground'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const insets = useSafeAreaInsets()

  const { login, isLoading, error, clearError } = useLogin()
  const haptics = useHaptics()
  const playPageFlipSound = usePageFlipSound()

  async function handleSubmit() {
    if (!username.trim() || !password) return
    haptics.lightImpact()
    playPageFlipSound()
    await login(username.trim(), password)
  }

  return (
    <View className="login">
      <GameBackground />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="login-inner"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 100) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="login-main">
            <Text className="login-title">The Archive</Text>
            <Text className="login-subtitle">Sign in to continue</Text>

            <View className="gap-4">
              <TextInput
                className="login-input"
                placeholder="Username"
                placeholderTextColor="#666"
                value={username}
                onChangeText={(t) => {
                  setUsername(t)
                  clearError()
                }}
                autoCapitalize="none"
                keyboardType="default"
                autoComplete="username"
                editable={!isLoading}
                returnKeyType="next"
              />

              <View className="relative">
                <TextInput
                  className="login-input pr-[52px]"
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t)
                    clearError()
                  }}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <TouchableOpacity
                  className="login-toggle"
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
                    name={isPasswordVisible ? 'book-open' : 'book'}
                    size={22}
                    color="#ffffffcc"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className={isLoading ? 'login-btn login-btn--disabled' : 'login-btn'}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="login-btn-text">Sign In</Text>
                )}
              </TouchableOpacity>

              {error ? (
                <Text
                  className="login-error"
                  accessibilityLiveRegion="polite"
                  accessibilityRole="alert"
                >
                  {error}
                </Text>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

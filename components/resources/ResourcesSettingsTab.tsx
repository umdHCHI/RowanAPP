import React, { useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useGameStore } from '@/stores/game-store'
import { CharacterAvatar } from '@/components/character/CharacterAvatar'
import { useCurrentUserFullProfile } from '@/api'
import { buildAvatarConfig } from '@/utils/character-avatar-config'

interface ResourcesSettingsTabProps {
  // Placeholder for future settings props
}

export function ResourcesSettingsTab({}: ResourcesSettingsTabProps) {
  const router = useRouter()
  const playPageFlipSound = usePageFlipSound()
  const soundMuted = useGameStore((state) => state.soundMuted)
  const toggleSoundMute = useGameStore((state) => state.toggleSoundMute)
  const textSpeed = useGameStore((state) => state.textSpeed)
  const cycleTextSpeed = useGameStore((state) => state.cycleTextSpeed)
  const { data: profileData } = useCurrentUserFullProfile()

  // Get avatar config from profile
  const avatarConfig = useMemo(() => {
    if (!profileData?.character) return null
    return buildAvatarConfig(profileData.character)
  }, [profileData])

  // Get experience (lumens) from profile
  const lumens = profileData?.character?.experience ?? 0

  function handleChangeCharacter() {
    playPageFlipSound()
    router.push('/character-creator')
  }

  function handleSoundToggle() {
    toggleSoundMute()
    if (!soundMuted) {
      playPageFlipSound()
    }
  }

  function handleTextSpeedToggle() {
    cycleTextSpeed()
    if (!soundMuted) {
      playPageFlipSound()
    }
  }

  function formatTextSpeed(speed: string): string {
    return speed.charAt(0).toUpperCase() + speed.slice(1)
  }

  function handleLogout() {
    playPageFlipSound()
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement logout logic when auth is ready
            // For now, just navigate to a login/start screen
            console.log('Logout pressed - auth not yet implemented')
            // router.replace('/login') // Uncomment when auth is ready
          },
        },
      ],
      { cancelable: true }
    )
  }

  function handleSettingPress(settingName: string) {
    playPageFlipSound()
    // TODO: Implement individual setting handlers
    console.log(`${settingName} pressed - settings not yet implemented`)
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your preferences and account.</Text>
        </View>

        {/* Profile Section */}
        {avatarConfig && (
          <View style={styles.profileCard}>
            <CharacterAvatar avatarConfig={avatarConfig} size={80} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profileData?.character?.name || 'Your Character'}
              </Text>
              <View style={styles.lumensContainer}>
                <MaterialCommunityIcons 
                  name="lightbulb-on" 
                  size={20} 
                  color="#FFD700" 
                />
                <Text style={styles.lumensText}>{lumens} Lumens</Text>
              </View>
            </View>
          </View>
        )}

        {/* Settings Sections */}
        <View style={styles.settingsList}>
          {/* General Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>GENERAL</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleSoundToggle}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                <MaterialCommunityIcons 
                  name={soundMuted ? "volume-off" : "volume-high"} 
                  size={24} 
                  color="#ffffff" 
                />
                <Text style={styles.settingItemText}>Sound</Text>
              </View>
              <Text style={styles.settingItemValue}>
                {soundMuted ? 'Muted' : 'On'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('Notifications')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                <MaterialCommunityIcons name="bell-outline" size={24} color="#ffffff" />
                <Text style={styles.settingItemText}>Notifications</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleTextSpeedToggle}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                <MaterialCommunityIcons name="text" size={24} color="#ffffff" />
                <Text style={styles.settingItemText}>Text Speed</Text>
              </View>
              <Text style={styles.settingItemValue}>
                {formatTextSpeed(textSpeed)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Account Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleChangeCharacter}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                {avatarConfig ? (
                  <CharacterAvatar avatarConfig={avatarConfig} size={32} />
                ) : (
                  <MaterialCommunityIcons name="account-outline" size={24} color="#ffffff" />
                )}
                <Text style={styles.settingItemText}>Change Your Character</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('Privacy')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemContent}>
                <MaterialCommunityIcons name="shield-outline" size={24} color="#ffffff" />
                <Text style={styles.settingItemText}>Privacy</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          </View>

          {/* Logout Section */}
          <View style={styles.settingsSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="logout" size={24} color="#ff4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 36,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 42,
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 24,
    gap: 16,
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  profileName: {
    fontFamily: 'BeyondWonderland',
    fontSize: 24,
    color: '#ffffff',
    lineHeight: 28,
  },
  lumensContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lumensText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  settingsList: {
    gap: 24,
  },
  settingsSection: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemText: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  settingItemValue: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
    marginTop: 8,
  },
  logoutButtonText: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '600',
    color: '#ff4444',
    letterSpacing: 0.5,
  },
})


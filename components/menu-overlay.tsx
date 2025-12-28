import type React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useHaptics } from '@/utils/useHaptics'
import { usePageFlipSound } from '@/utils/usePageFlipSound'

const { width, height } = Dimensions.get('window')

interface MenuOverlayProps {
  visible: boolean
  onClose: () => void
}

interface MenuItem {
  label: string
  route: string
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
}

const menuItems: MenuItem[] = [
  { label: 'About The Archive', route: '/about' },
  { label: 'Resources', route: '/resources' },
  { label: 'Profile', route: '/profile' },
  { label: 'Start a new story', route: '/hub' },
  { label: 'Crisis Help', route: '/crisis-help' },
]

export function MenuOverlay({ visible, onClose }: MenuOverlayProps) {
  const router = useRouter()
  const haptics = useHaptics()
  const playPageFlipSound = usePageFlipSound()

  function handleMenuItemPress(route: string) {
    haptics.mediumImpact()
    playPageFlipSound()
    onClose()
    router.push(route as any)
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.menuContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                haptics.lightImpact()
                playPageFlipSound()
                onClose()
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>

            <Text style={styles.menuTitle}>Menu</Text>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                haptics.lightImpact()
                // TODO: Navigate to settings
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="cog" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Menu Items */}
          <View style={styles.menuItemsContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item.route)}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  menuTitle: {
    fontFamily: 'BeyondWonderland',
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },
  settingsButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 16,
  },
  menuItemsContainer: {
    gap: 8,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  menuItemText: {
    fontFamily: 'BeyondWonderland',
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'left',
  },
})


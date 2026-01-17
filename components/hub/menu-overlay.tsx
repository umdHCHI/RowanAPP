import type React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, Linking, ScrollView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useHaptics } from '@/utils/useHaptics'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width, height } = Dimensions.get('window')

interface MenuOverlayProps {
  visible: boolean
  onClose: () => void
}

interface MenuItem {
  label: string
  route?: string
  action?: () => void
}


const menuItems: MenuItem[] = [
  { label: 'About The Archive', route: '/about' },
  { label: 'Start a new story', route: '/hub' },
  { label: 'Crisis help', route: '/crisis-help' },
  { label: 'Report a bug', action: () => {
    // TODO: Implement bug reporting
  } },
]

export function MenuOverlay({ visible, onClose }: MenuOverlayProps) {
  const router = useRouter()
  const haptics = useHaptics()
  const playPageFlipSound = usePageFlipSound()
  const insets = useSafeAreaInsets()

  function handleMenuItemPress(item: MenuItem) {
    haptics.mediumImpact()
    playPageFlipSound()
    onClose()
    
    if (item.route) {
      router.push(item.route as any)
    } else if (item.action) {
      item.action()
    }
  }

 

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.menuContainer}>
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


          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Menu Items - Scrollable */}
          <ScrollView 
            style={styles.menuItemsScrollView}
            contentContainerStyle={styles.menuItemsContainer}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Divider */}
          <View style={styles.divider} />

         
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    width: width,
    height: height,
  },
  menuContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
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
  menuItemsScrollView: {
    flex: 1,
  },
  menuItemsContainer: {
    gap: 8,
    paddingBottom: 8,
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
  socialContainer: {
    gap: 24,
    marginTop: 'auto',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  socialIconContainer: {
    alignItems: 'center',
    gap: 8,
  },
  socialIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  socialIconLabel: {
    fontFamily: 'BeyondWonderland',
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
  },
})


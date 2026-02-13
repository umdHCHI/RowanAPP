
import { View, Text, TouchableOpacity,  Modal,  ScrollView } from 'react-native'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BugReportModal } from './BugReportingModal'
import { useState } from 'react'
import { hubMenuOverlayStyles } from '@/styles/hub/hub-styles'
import type { MenuOverlayProps, MenuItem } from '@/types/hub/hub'
import { Button } from '@/components/ui'




export function MenuOverlay({ visible, onClose }: MenuOverlayProps) {
  const router = useRouter()

  const insets = useSafeAreaInsets()
  const [bugReportVisible, setBugReportVisible] = useState(false)

  const menuItems: MenuItem[] = [
  { label: 'About The Archive', route: '/about' },
  { label: 'Back to The Archive', route: '/hub' },
  { label: 'UMN Duluth Counseling Resources', route: '/crisis-help' },
  { label: 'Report a bug', action: () => setBugReportVisible(true)},
]

  function handleMenuItemPress(item: MenuItem) {
    onClose()
    
    if (item.route) {
      router.push(item.route as any)
    } else if (item.action) {
      item.action()
    }
  }

 

  return (
    <>
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[hubMenuOverlayStyles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={hubMenuOverlayStyles.menuContainer}>
          {/* Header */}
          <View style={hubMenuOverlayStyles.header}>
            <TouchableOpacity
              style={hubMenuOverlayStyles.closeButton}
              onPress={() => {

                onClose()
              }}
              activeOpacity={0.7}
            >
              <MaterialDesignIcons name="close-circle" size={24} color="#ffffff" />
            </TouchableOpacity>

            <Text style={hubMenuOverlayStyles.menuTitle}>Menu</Text>


          </View>

          {/* Divider */}
          <View style={hubMenuOverlayStyles.divider} />

          {/* Menu Items - Scrollable */}
          <ScrollView 
            style={hubMenuOverlayStyles.menuItemsScrollView}
            contentContainerStyle={hubMenuOverlayStyles.menuItemsContainer}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant="secondary"
                size="small"
                onPress={() => handleMenuItemPress(item)}
                fullWidth
                enableSound={true}
                enableHaptics={true}
              >
                <Text style={hubMenuOverlayStyles.menuItemText}>{item.label}</Text>
              </Button>
 
            ))}
          </ScrollView>

          {/* Divider */}
          <View style={hubMenuOverlayStyles.divider} />

         
        </View>
      </View>
    </Modal>

    <BugReportModal
      visible={bugReportVisible}
      onClose={() => setBugReportVisible(false)}
      />
    </>
  )
}


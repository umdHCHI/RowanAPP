import type React from 'react'
import { useState } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { MenuOverlay } from './menu-overlay'

interface HeaderAction {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap
  onPress: () => void
  customComponent?: React.ReactNode
}

interface HeaderProps {
  onMenuPress?: () => void
  rightActions?: HeaderAction[]
  showMenu?: boolean
  backgroundColor?: string
}

export function Header({
  onMenuPress,
  rightActions = [],
  showMenu = true,
  backgroundColor = 'transparent',
}: HeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false)

  function handleMenuPress() {
    setMenuVisible(true)
    if (onMenuPress) {
      onMenuPress()
    }
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor }]}>
        {/* Center menu icon */}
        {showMenu && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenuPress}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="menu" size={24} color="#f5f2ff" />
          </TouchableOpacity>
        )}

        {/* Right icons */}
        {rightActions.length > 0 && (
          <View style={styles.rightIcons}>
            {rightActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.iconButton}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                {action.customComponent ||
                  (action.icon && (
                    <MaterialCommunityIcons
                      name={action.icon}
                      size={24}
                      color="#ffffff"
                    />
                  ))}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <MenuOverlay visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  )
}

// Circle icon component for reuse
export function CircleIcon({ size = 28 }: { size?: number }) {
  return (
    <View style={[styles.circleIcon, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.circleIconInner, { width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15 }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  rightIcons: {
    position: 'absolute',
    top: 60,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  circleIcon: {
    borderWidth: 1.5,
    borderColor: '#ffffffaa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleIconInner: {
    backgroundColor: '#ffffff',
  },
})


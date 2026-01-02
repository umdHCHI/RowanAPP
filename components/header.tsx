import type React from 'react'
import { useState } from 'react'
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { MenuOverlay } from '@/components/hub/menu-overlay'
import { useGameStore } from '@/stores/game-store'
import { useHaptics } from '@/utils/useHaptics'

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
  const soundMuted = useGameStore((state) => state.soundMuted)
  const toggleSoundMute = useGameStore((state) => state.toggleSoundMute)
  const textSpeed = useGameStore((state) => state.textSpeed)
  const cycleTextSpeed = useGameStore((state) => state.cycleTextSpeed)
  const haptics = useHaptics()
  const insets = useSafeAreaInsets()

  function handleMenuPress() {
    haptics.lightImpact()
    setMenuVisible(true)
    if (onMenuPress) {
      onMenuPress()
    }
  }

  function handleSoundToggle() {
    haptics.selection()
    toggleSoundMute()
  }

  function handleSpeedToggle() {
    haptics.selection()
    cycleTextSpeed()
  }

  // Get speed icon based on current text speed
  const speedIconName =
    textSpeed === 'slow'
      ? 'timer-sand'
      : textSpeed === 'fast'
      ? 'timer-sand-full'
      : 'timer-sand-complete'

  return (
    <>
      <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
        {/* Center menu icon */}
        {showMenu && (
          <TouchableOpacity
            style={[styles.menuButton, { top: insets.top + 20 }]}
            onPress={handleMenuPress}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="menu" size={24} color="#f5f2ff" />
          </TouchableOpacity>
        )}

        {/* Right icons */}
        <View style={[styles.rightIcons, { top: insets.top + 10 }]}>
          {/* Text speed toggle button */}
          <TouchableOpacity
            style={[styles.iconButton, styles.speedButton]}
            onPress={handleSpeedToggle}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={speedIconName}
              size={24}
              color="#ffffff"
            />
            <Text style={styles.speedLabel}>
              {textSpeed === 'slow' ? 'S' : textSpeed === 'fast' ? 'F' : 'N'}
            </Text>
          </TouchableOpacity>

          {/* Sound toggle button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSoundToggle}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={soundMuted ? 'volume-off' : 'volume-high'}
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>

          {/* Custom right actions */}
          {rightActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.iconButton}
              onPress={() => {
                haptics.lightImpact()
                action.onPress()
              }}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 60,
    elevation: 9999, // Android elevation
  },
  menuButton: {
    position: 'absolute',
    left: '50%',
    marginLeft: -22, // Half of button width to center it
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    zIndex: 10001,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 22,
  },
  rightIcons: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10001,
  },
  iconButton: {
    padding: 4,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10001,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 22,
  },
  speedButton: {
    position: 'relative',
  },
  speedLabel: {
    position: 'absolute',
    bottom: 2,
    fontSize: 9,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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


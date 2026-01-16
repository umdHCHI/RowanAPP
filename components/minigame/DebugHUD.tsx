import { View, Text, StyleSheet } from 'react-native'

interface DebugHUDProps {
  stressSignal: number
  emotionalIntensity: number
  wave: number
  visible?: boolean
}

export function DebugHUD({
  stressSignal,
  emotionalIntensity,
  wave,
  visible = false,
}: DebugHUDProps) {
  if (!visible) return null

  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={styles.label}>Debug HUD</Text>
      <Text style={styles.text}>Stress: {stressSignal.toFixed(2)}</Text>
      <Text style={styles.text}>EI: {emotionalIntensity.toFixed(2)}</Text>
      <Text style={styles.text}>Wave: {wave}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    zIndex: 1000,
  },
  label: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 10,
    color: 'rgba(212, 175, 55, 0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  text: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 2,
  },
})

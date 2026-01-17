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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1000,
  },
  label: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    marginBottom: 8,
  },
  text: {
    fontFamily: 'System',
    fontSize: 13,
    color: '#ffffffaa',
    marginBottom: 4,
  },
})

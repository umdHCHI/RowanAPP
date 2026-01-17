import { View, Text, StyleSheet } from 'react-native'

export function BossIncomingMoment() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.labelRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.label}>A BIG BAD EMERGES</Text>
          <View style={styles.dividerLine} />
        </View>
        <Text style={styles.message}>Defeat it to seal the breach.</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    maxWidth: 320,
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  label: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
  },
  message: {
    fontFamily: 'VT323-Regular',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
})


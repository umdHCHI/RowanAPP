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
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.6)',
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
    backgroundColor: 'rgba(212, 175, 55, 0.4)',
  },
  label: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#D4AF37',
    textTransform: 'uppercase',
  },
  message: {
    fontFamily: 'CrimsonPro-Medium-Italic',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
})


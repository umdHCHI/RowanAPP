import { View, Text, StyleSheet } from 'react-native'

interface PowerUpIndicatorsProps {
  multishotActive?: boolean
  fastShootActive?: boolean
  shieldActive?: boolean
}

export function PowerUpIndicators({
  multishotActive = false,
  fastShootActive = false,
  shieldActive = false,
}: PowerUpIndicatorsProps) {
  if (!multishotActive && !fastShootActive && !shieldActive) {
    return null
  }

  return (
    <View style={styles.container}>
      {multishotActive && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Multishot</Text>
        </View>
      )}
      {fastShootActive && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Fast Shoot</Text>
        </View>
      )}
      {shieldActive && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Shield</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  badgeText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 10,
    color: 'rgba(212, 175, 55, 0.9)',
    fontWeight: '600',
  },
})


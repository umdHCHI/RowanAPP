import { View, ScrollView } from 'react-native'
import { useGameStore, Equipment } from '@/stores/game-store'
import { Card, Text, useTheme } from 'react-native-paper'

export function EquipmentDisplay() {
  const { equipment } = useGameStore()
  const theme = useTheme()

  if (equipment.length === 0) {
    return (
      <View style={{ paddingHorizontal: 24 }}>
        <Text
          variant="titleLarge"
          style={{
            color: theme.colors.onSurface,
            marginBottom: 24,
          }}
        >
          Equipment
        </Text>
        <Card style={{ backgroundColor: theme.colors.surface }}>
          <Card.Content style={{ padding: 24, alignItems: 'center' }}>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
              }}
            >
              No equipment yet. Continue your journey to unlock items!
            </Text>
          </Card.Content>
        </Card>
      </View>
    )
  }

  const equipmentByType = {
    weapon: equipment.filter((e) => e.type === 'weapon'),
    armor: equipment.filter((e) => e.type === 'armor'),
    helmet: equipment.filter((e) => e.type === 'helmet'),
    boots: equipment.filter((e) => e.type === 'boots'),
  }

  function getEquipmentIcon(type: string) {
    switch (type) {
      case 'weapon':
        return '⚔️'
      case 'armor':
        return '🛡️'
      case 'helmet':
        return '⛑️'
      case 'boots':
        return '👢'
      default:
        return '📦'
    }
  }

  function renderEquipmentSection(type: string, items: Equipment[]) {
    if (items.length === 0) return null

    return (
      <View key={type} style={{ marginBottom: 24 }}>
        <Text
          variant="titleMedium"
          style={{
            color: theme.colors.onSurface,
            marginBottom: 16,
            paddingHorizontal: 8,
          }}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {items.map((item) => (
            <Card
              key={item.id}
              style={{
                backgroundColor: theme.colors.surface,
                width: '45%',
              }}
            >
              <Card.Content style={{ padding: 12, alignItems: 'center' }}>
                <View
                  style={{
                    width: '100%',
                    aspectRatio: 1,
                    backgroundColor: theme.colors.surfaceVariant,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 48 }}>
                    {getEquipmentIcon(type)}
                  </Text>
                </View>
                <Text
                  variant="bodySmall"
                  numberOfLines={2}
                  style={{
                    color: theme.colors.onSurface,
                    textAlign: 'center',
                  }}
                >
                  {item.name}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>
    )
  }

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <Text
        variant="titleLarge"
        style={{
          color: theme.colors.onSurface,
          marginBottom: 24,
        }}
      >
        Your Equipment
      </Text>
      
      {renderEquipmentSection('weapon', equipmentByType.weapon)}
      {renderEquipmentSection('armor', equipmentByType.armor)}
      {renderEquipmentSection('helmet', equipmentByType.helmet)}
      {renderEquipmentSection('boots', equipmentByType.boots)}
    </View>
  )
}

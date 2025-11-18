import React from 'react';
import { View, Text, Image, TouchableOpacity, LinearGradient, Alert } from '../../../imports';
import { getGearSlotImage } from '../utils/gearHelpers';

interface GearSlotProps {
  slot: {
    type: string;
    label: string;
    icon: any;
    slot: 'weapon' | 'armor' | 'helmet' | 'boots';
  };
  equippedGear: any;
  onPress: () => void;
  homeStyles: any;
  homeTheme: any;
}

export const GearSlot: React.FC<GearSlotProps> = ({
  slot,
  equippedGear,
  onPress,
  homeStyles,
  homeTheme
}) => {
  return (
    <TouchableOpacity
      style={homeStyles.gearSlot}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[
          homeTheme.gearSlotGradientStart || 'rgba(10, 11, 15, 0.9)',
          homeTheme.gearSlotGradientEnd || 'rgba(30, 41, 59, 0.7)',
        ]}
        style={homeStyles.gearSlotGradient}
      >
        {equippedGear ? (
          <View style={homeStyles.equippedGearSlot}>
            <Image
              source={getGearSlotImage(equippedGear)}
              style={{
                width: 32,
                height: 32,
                marginBottom: 4,
              }}
              resizeMode="contain"
            />
            <Text style={homeStyles.gearSlotLabel}>
              {equippedGear.gear_type.name}
            </Text>
          </View>
        ) : (
          <View style={homeStyles.emptyGearSlot}>
            {typeof slot.icon === 'string' ? (
              <Text style={homeStyles.gearSlotIcon}>
                {slot.icon}
              </Text>
            ) : slot.icon && (typeof slot.icon === 'object' || typeof slot.icon === 'number') ? (
              <Image
                source={slot.icon}
                style={{
                  width: 24,
                  height: 24,
                  marginBottom: 4,
                }}
                resizeMode="contain"
              />
            ) : (
              <Text style={homeStyles.gearSlotIcon}>
                ?
              </Text>
            )}
            <Text style={homeStyles.gearSlotLabel}>
              {slot.label}
            </Text>
            <Text style={homeStyles.gearSlotLockedText}>
              Locked
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};
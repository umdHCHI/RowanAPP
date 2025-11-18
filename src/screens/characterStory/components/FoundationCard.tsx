import React from 'react';
import { View, Text, TouchableOpacity, Image, LinearGradient, Icon } from '../../../imports';
import { getFoundationIcon } from '../utils/foundationHelpers';

interface FoundationCardProps {
  foundation: any;
  index: number;
  homeStyles: any;
  homeTheme: any;
  onPress: (foundation: any) => void;
}

export const FoundationCard: React.FC<FoundationCardProps> = ({
  foundation,
  index,
  homeStyles,
  homeTheme,
  onPress
}) => {
  const isWellnessStats = "label" in foundation && "value" in foundation;

  if (isWellnessStats) {
    const currentValue = foundation.value || 0;
    const maxValue = 20;
    const currentLevel = Math.floor(currentValue / 5) + 1;
    const progressInCurrentLevel = currentValue % 5;
    const xpToNextLevel = currentValue >= maxValue ? 0 : 5 - progressInCurrentLevel;

    return (
      <TouchableOpacity
        key={index}
        style={homeStyles.foundationCard}
        onPress={() => onPress({
          label: foundation.label,
          value: currentValue,
          maxValue: maxValue,
          color: foundation.color,
        })}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[
            homeTheme.foundationCardGradientStart || 'rgba(10, 11, 15, 0.95)',
            homeTheme.foundationCardGradientMiddle || 'rgba(30, 41, 59, 0.8)',
            homeTheme.foundationCardGradientEnd || 'rgba(10, 11, 15, 0.95)',
          ]}
          style={homeStyles.foundationCardGradient}
          pointerEvents="none"
        >
          <View style={homeStyles.foundationIconContainer}>
            <Image
              source={getFoundationIcon(foundation)}
              style={{
                width: 32,
                height: 32,
              }}
              resizeMode="contain"
            />
          </View>

          <View style={homeStyles.foundationValueContainer}>
            <Text style={homeStyles.foundationValue}>
              {currentValue}
              <Text style={homeStyles.foundationMaxValue}>
                /{maxValue}
              </Text>
            </Text>
            <Text style={homeStyles.foundationLevel}>
              Level {currentLevel}
            </Text>
          </View>

          <View style={homeStyles.foundationProgressContainer}>
            <View style={homeStyles.foundationProgressBar}>
              <LinearGradient
                colors={[
                  foundation.color,
                  foundation.color,
                ]}
                style={[
                  homeStyles.foundationProgressFill,
                  {
                    width: `${Math.min((currentValue / maxValue) * 100, 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={homeStyles.xpToNext}>
              {currentValue >= maxValue ? "Max Level!" : `${xpToNextLevel} Lumens to next level`}
            </Text>
          </View>

          <Text style={homeStyles.foundationLabel}>
            {foundation.label}
          </Text>
          <Text style={homeStyles.foundationDescription}>
            Your {foundation.label.toLowerCase()} foundation
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Legacy foundation card
  return (
    <TouchableOpacity
      key={index}
      style={homeStyles.foundationCard}
      onPress={() => onPress({
        label: foundation.label,
        value: foundation.value,
        maxValue: foundation.maxValue,
        color: foundation.colors?.[0] || '#4ee6e6',
      })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[
          homeTheme.foundationCardGradientStart || 'rgba(10, 11, 15, 0.95)',
          homeTheme.foundationCardGradientMiddle || 'rgba(30, 41, 59, 0.8)',
          homeTheme.foundationCardGradientEnd || 'rgba(10, 11, 15, 0.95)',
        ]}
        style={homeStyles.foundationCardGradient}
        pointerEvents="none"
      >
        <View style={homeStyles.foundationIconContainer}>
          <Image
            source={getFoundationIcon(foundation)}
            style={{
              width: 32,
              height: 32,
            }}
            resizeMode="contain"
          />
          {foundation.recentGain > 0 && (
            <View style={homeStyles.recentGainBadge}>
              <LinearGradient
                colors={["#10B981", "#34D399"]}
                style={homeStyles.recentGainGradient}
              >
                <Text style={homeStyles.recentGainText}>
                  +{foundation.recentGain}
                </Text>
              </LinearGradient>
            </View>
          )}
        </View>

        <View style={homeStyles.foundationValueContainer}>
          <Text style={homeStyles.foundationValue}>
            {foundation.value}
            <Text style={homeStyles.foundationMaxValue}>
              /{foundation.maxValue}
            </Text>
          </Text>
          <Text style={homeStyles.foundationLevel}>
            Level {Math.floor(foundation.value / 5) + 1}
          </Text>
        </View>

        <View style={homeStyles.foundationProgressContainer}>
          <View style={homeStyles.foundationProgressBar}>
            <LinearGradient
              colors={foundation.colors as any}
              style={[
                homeStyles.foundationProgressFill,
                {
                  width: `${
                    (foundation.value /
                      foundation.maxValue) *
                    100
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={homeStyles.xpToNext}>
            {5 - (foundation.value % 5)} Lumens to next unlock
          </Text>
        </View>

        <Text style={homeStyles.foundationLabel}>
          {foundation.label}
        </Text>
        <Text style={homeStyles.foundationDescription}>
          {foundation.description}
        </Text>

        <View style={homeStyles.nextUnlockContainer}>
          <Icon name="lock" size={10} color="#FCD34D" />
          <Text style={homeStyles.nextUnlockText}>
            {foundation.nextUnlock}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};
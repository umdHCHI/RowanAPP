import React from 'react';
import { TouchableOpacity, Text, Image, LinearGradient, Icon, StyleSheet } from '../../../imports';

interface TabButtonProps {
  title: string;
  icon: string | any;
  isActive: boolean;
  onPress: () => void;
  homeStyles: any;
  homeTheme: any;
}

const safeColor = (value: any, fallback: string): string => {
  return (typeof value === 'string' && value.length > 0) ? value : fallback;
};

export const TabButton: React.FC<TabButtonProps> = ({
  title,
  icon,
  isActive,
  onPress,
  homeStyles,
  homeTheme
}) => (
  <TouchableOpacity
    style={[homeStyles.tabButton, isActive && homeStyles.activeTab]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {isActive && (
      <LinearGradient
        colors={[
          safeColor(homeTheme.tabIsActiveGradient, 'rgba(78, 230, 230, 0.4)'),
          safeColor(homeTheme.tabIsActiveSecondaryGradient, 'rgba(6, 182, 212, 0.4)')
        ]}
        style={StyleSheet.absoluteFillObject}
      />
    )}
    {typeof icon === 'string' ? (
      <Icon name={icon} size={18} color={safeColor(isActive ? homeTheme.tabTextColor : homeTheme.tabTextSecondColor, isActive ? '#4ee6e6' : '#94a3b8')} />
    ) : (
      <Image
        source={icon}
        style={{
          width: 18,
          height: 18,
          opacity: isActive ? 1 : 0.7
        }}
        resizeMode="contain"
      />
    )}
    <Text
      style={[
        homeStyles.tabText,
        isActive ? homeStyles.tabTextActive : homeStyles.tabTextInactive,
        { color: safeColor(isActive ? homeTheme.tabTextColor : homeTheme.tabTextSecondColor, isActive ? '#4ee6e6' : '#94a3b8') }
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);
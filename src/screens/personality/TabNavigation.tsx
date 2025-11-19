import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { PersonalityConfigs } from '../../constants/personality';
import { PersonalityKey } from '../../imports';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  primaryTrait: PersonalityKey;
  globalStyles: any;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  primaryTrait,
  globalStyles
}) => {
  const tabs = [
    { key: 'entrance', label: 'The Archive', icon: '🌑' },
    { key: 'stories', label: 'Living Pages', icon: '📖' },
    { key: 'codex', label: 'Codex', icon: '📜' },
    { key: 'defender', label: 'Mind Defender', icon: '🛡️' },
    { key: 'restoration', label: 'Restoration', icon: '🌿' }
  ];

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#0a0b0f',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(78, 230, 230, 0.2)',
      gap: 8,
    }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 4,
            borderRadius: 12,
            backgroundColor: activeTab === tab.key
              ? 'rgba(78, 230, 230, 0.18)'
              : 'rgba(255, 255, 255, 0.04)',
            borderWidth: 1,
            borderColor: activeTab === tab.key ? '#4ee6e6' : 'rgba(255, 255, 255, 0.08)',
          }}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.7}
        >
          <Text style={{
            color: activeTab === tab.key ? '#dfffff' : '#c7d0e0',
            fontSize: 13,
            fontWeight: activeTab === tab.key ? '700' : '500',
            textAlign: 'center'
          }} numberOfLines={1}>
            {tab.icon} {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

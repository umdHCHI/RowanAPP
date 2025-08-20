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
    { key: 'entrance', label: 'Entrance', icon: '🏛️' },
            { key: 'stories', label: 'Stories', icon: '📖' },
    { key: 'codex', label: 'Codex', icon: '📝' },
    { key: 'defender', label: 'Defender', icon: '⚡' },
    { key: 'restoration', label: 'Restoration', icon: '🌱' }
  ];

  return (
    <View style={globalStyles.personalityTabBar || { 
      flexDirection: 'row', 
      backgroundColor: PersonalityConfigs[primaryTrait]?.theme?.background || '#1a1a1a', 
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: PersonalityConfigs[primaryTrait]?.theme?.primary || '#4ee6e6',
      shadowColor: PersonalityConfigs[primaryTrait]?.theme?.primary || '#4ee6e6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3
    }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            {
              flex: 1,
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 8,
              borderRadius: 8,
              marginHorizontal: 2,
            },
            activeTab === tab.key && {
              backgroundColor: PersonalityConfigs[primaryTrait]?.theme?.primary || '#4ee6e6',
              shadowColor: PersonalityConfigs[primaryTrait]?.theme?.primary || '#4ee6e6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3
            }
          ]}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.7}
        >
          <Text style={{ 
            fontSize: 16, 
            marginBottom: 4,
            opacity: activeTab === tab.key ? 1 : 0.7
          }}>
            {tab.icon}
          </Text>
          <Text style={{ 
            color: activeTab === tab.key ? '#000' : '#fff',
            fontSize: 10,
            fontWeight: activeTab === tab.key ? 'bold' : 'normal',
            textAlign: 'center'
          }}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

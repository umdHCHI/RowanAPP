import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { PersonalityKey } from '../../imports';
import { DailyCuratorMessages } from '../../types/personality';

interface DailyCuratorMessageProps {
  primaryTrait: PersonalityKey;
  characterData: any;
  globalStyles: any;
}

export const DailyCuratorMessage: React.FC<DailyCuratorMessageProps> = ({
  primaryTrait,
  characterData,
  globalStyles
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Get today's message (could be based on date, character progress, etc.)
    const messages = (DailyCuratorMessages as any)[primaryTrait];
    const today = new Date().getDate();
    const messageIndex = today % messages.length;
    setCurrentMessage(messages[messageIndex]);
  }, [primaryTrait]);

  const getPersonalizedGreeting = () => {
    const level = characterData?.level || 1;
    const name = characterData?.name || 'Scholar';
    
    if (level >= 10) return `Master ${name}`;
    if (level >= 5) return `Skilled ${name}`;
    return `Young ${name}`;
  };

  return (
    <TouchableOpacity 
      style={globalStyles.personalityCuratorMessageCard}
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.8}
    >
      <View style={globalStyles.personalityCuratorHeader}>
        <Text style={globalStyles.personalityCuratorAvatar}>🧙‍♂️</Text>
        <View style={globalStyles.personalityCuratorInfo}>
          <Text style={globalStyles.personalityCuratorName}>The Curator</Text>
          <Text style={globalStyles.personalityCuratorTitle}>Keeper of The Archive</Text>
        </View>
        <Text style={globalStyles.personalityDailyLabel}>Daily Wisdom</Text>
      </View>
      
      <View style={globalStyles.personalityMessageContent}>
        <Text style={globalStyles.personalityPersonalizedGreeting}>
          &quot;{getPersonalizedGreeting()}, 
        </Text>
        <Text style={globalStyles.personalityCuratorMessage}>
          {currentMessage}&quot;
        </Text>
      </View>
      
      {isExpanded && (
        <View style={globalStyles.personalityExpandedContent}>
          <Text style={globalStyles.personalityExpandedHint}>
            💡 Tap any wellness attribute to focus your practice today
          </Text>
          <Text style={globalStyles.personalityExpandedFooter}>
            ~ Written in the {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} entry of the Daily Chronicle
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

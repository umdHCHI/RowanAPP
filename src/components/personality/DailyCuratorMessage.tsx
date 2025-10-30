import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
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

  useEffect(() => {
    // Get today's message (could be based on date, character progress, etc.)
    const messages = (DailyCuratorMessages as any)[primaryTrait];
    const today = new Date().getDate();
    const messageIndex = today % messages.length;
    setCurrentMessage(messages[messageIndex]);
  }, [primaryTrait]);

  const getNextObjective = () => {
    const questProgress = characterData?.quest_progress || {};
    const incompleteQuests = Object.entries(questProgress).filter(([_, progress]: [string, any]) => progress < 100);

    if (incompleteQuests.length > 0) {
      const [questName] = incompleteQuests[0];
      return `Complete "${questName}"`;
    }
    return "Enter the Living Pages";
  };

  return (
    <View style={styles.curatorBriefContainer}>
      <View style={styles.curatorBriefHeader}>
        <Image
          source={require('../../../assets/UI/assets/thecurator/curatorstretch.png')}
          style={styles.curatorSmallAvatar}
          resizeMode="contain"
        />
        <View style={styles.curatorBriefContent}>
          <Text style={styles.curatorBriefNarrative} numberOfLines={1}>
            {currentMessage}
          </Text>
          <View style={styles.objectiveRow}>
            <Text style={styles.objectiveLabel}>Next Objective:</Text>
            <Text style={styles.objectiveText} numberOfLines={1}>{getNextObjective()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  curatorBriefContainer: {
    backgroundColor: 'rgba(78, 230, 230, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#4ee6e6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  curatorBriefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  curatorSmallAvatar: {
    width: 32,
    height: 32,
  },
  curatorBriefContent: {
    flex: 1,
    gap: 4,
  },
  curatorBriefNarrative: {
    fontSize: 13,
    color: '#d0d0d0',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  objectiveLabel: {
    fontSize: 12,
    color: '#4ee6e6',
    fontWeight: '700',
  },
  objectiveText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
  },
});

import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PersonalityKey } from '../../imports';
import { DailyCuratorMessages, PersonalityQuests } from '../../types/personality';

interface DailyCuratorMessageProps {
  primaryTrait: PersonalityKey;
  characterData: any;
  globalStyles: any;
}

export const DailyCuratorMessage: React.FC<DailyCuratorMessageProps> = ({
  primaryTrait,
  characterData,
  globalStyles,
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const messages = (DailyCuratorMessages as any)[primaryTrait];
    const today = new Date().getDate();
    const messageIndex = today % messages.length;
    setCurrentMessage(messages[messageIndex]);
  }, [primaryTrait]);

  // Helper to get quest title from PersonalityQuests
  const getQuestTitle = (questId: string) => {
    const quests = (PersonalityQuests as any)[primaryTrait] || [];
    const quest = quests.find((q: any) => q.id === questId);
    return quest ? quest.title : 'Unknown Quest';
  };

  const getNextObjective = () => {
    const questProgress = characterData?.quest_progress || {};
    const incompleteQuests = Object.entries(questProgress).filter(([_, progress]: [string, any]) => progress < 100);

    if (incompleteQuests.length > 0) {
      const [questId] = incompleteQuests[0];
      const questTitle = getQuestTitle(questId);
      return `Complete "${questTitle}"`;
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
          <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
            <Text
              style={styles.curatorBriefNarrative}
              numberOfLines={expanded ? undefined : 2}
            >
              {currentMessage}
            </Text>
            {currentMessage.length > 80 && (
              <Text style={styles.expandHint}>
                {expanded ? 'Show less ▲' : 'Show more ▼'}
              </Text>
            )}
          </TouchableOpacity>
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
  expandHint: {
    fontSize: 11,
    color: '#4ee6e6',
    fontStyle: 'italic',
    marginTop: 2,
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

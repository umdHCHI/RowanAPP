import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Story } from './StoryCatalogScreen';

// Sample story data structure
const sampleStoryData = {
  id: '1',
  title: 'The Forest Awakens',
  passages: [
    {
      id: 'start',
      text: 'You awaken in a misty forest. The air is thick with the scent of pine and something else... A voice whispers: "Will you follow the path?"',
      choices: [
        { text: 'Follow the path', next: 'path' },
        { text: 'Explore the woods', next: 'woods' },
        { text: 'Call out for help', next: 'call' },
      ],
    },
    {
      id: 'path',
      text: 'You follow the winding path deeper into the forest. The trees seem to close in around you.',
      choices: [
        { text: 'Keep going', next: 'clearing' },
        { text: 'Turn back', next: 'start' },
      ],
    },
    {
      id: 'woods',
      text: 'You wander off the path, the undergrowth thickening. You hear a distant howl.',
      choices: [
        { text: 'Investigate the howl', next: 'howl' },
        { text: 'Return to the path', next: 'path' },
      ],
    },
    {
      id: 'call',
      text: 'Your voice echoes through the trees. Something stirs in the shadows.',
      choices: [
        { text: 'Run', next: 'path' },
        { text: 'Stand your ground', next: 'clearing' },
      ],
    },
    {
      id: 'clearing',
      text: 'You emerge into a sunlit clearing. Your journey is just beginning...',
      choices: [
        { text: 'The End', next: null } // End of story
      ],
    },
    {
      id: 'howl',
      text: 'A wolf appears, but it seems more curious than hostile. It watches you with intelligent eyes.',
      choices: [
        { text: 'Approach the wolf', next: 'clearing' },
        { text: 'Retreat', next: 'woods' },
      ],
    },
  ],
};

type StoryScreenProps = {
  visible: boolean;
  onClose: () => void;
  story?: Story;
};

const StoryScreen = ({ visible, onClose, story }: StoryScreenProps) => {
  // Use the provided story or fallback to sample
  const passages = (story as any)?.passages || sampleStoryData.passages;
  const [currentId, setCurrentId] = useState('start');
  const current = passages.find((p: any) => p.id === currentId);

  const handleChoice = (nextId: string | null) => {
    if (nextId) {
      setCurrentId(nextId);
    } else {
      onClose(); // End of story
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>{(story && story.title) || sampleStoryData.title}</Text>
        <ScrollView style={styles.passageBox} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <Text style={styles.passage}>{current.text}</Text>
        </ScrollView>
        <View style={styles.choicesBox}>
          {current.choices.map((choice: any, idx: number) => (
            <TouchableOpacity
              key={idx}
              style={styles.choiceBtn}
              onPress={() => handleChoice(choice.next)}
            >
              <Text style={styles.choiceText}>{choice.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Exit</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#ffe066',
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 18,
    alignSelf: 'center',
  },
  passageBox: {
    flex: 1,
    width: '100%',
    marginBottom: 24,
  },
  passage: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 18,
  },
  choicesBox: {
    width: '100%',
    marginBottom: 18,
  },
  choiceBtn: {
    backgroundColor: '#23242b',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  choiceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    backgroundColor: '#4ee6e6',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 8,
  },
  closeBtnText: {
    color: '#181A20',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StoryScreen; 
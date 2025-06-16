import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type Story = {
  id: string;
  title: string;
  image: any;
  description: string;
};

type StoryCatalogModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectStory: (story: Story) => void;
};

const sampleStories: Story[] = [
  {
    id: '1',
    title: 'The Forest Awakens',
    image: require('../../../assets/images/story1.jpg'),
    description: 'A mysterious power stirs in the ancient woods...'
  },
  {
    id: '2',
    title: 'Desert of Echoes',
    image: require('../../../assets/images/story2.jpg'),
    description: 'Lost voices call out across the endless sands.'
  },
  {
    id: '3',
    title: 'City of Masks',
    image: require('../../../assets/images/story3.jpg'),
    description: 'Secrets hide behind every smile in the city.'
  },
];

const StoryCatalogModal = ({ visible, onClose, onSelectStory }: StoryCatalogModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.header}>Story Catalog</Text>
          <ScrollView contentContainerStyle={styles.grid}>
            {sampleStories.map(story => (
              <TouchableOpacity
                key={story.id}
                style={styles.card}
                onPress={() => onSelectStory(story)}
                activeOpacity={0.85}
              >
                <Image source={story.image} style={styles.image} />
                <Text style={styles.title}>{story.title}</Text>
                <Text style={styles.desc}>{story.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#181A20',
    borderRadius: 18,
    padding: 18,
    width: '90%',
    maxHeight: '85%',
    alignItems: 'center',
  },
  header: {
    color: '#ffe066',
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 18,
    alignSelf: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 32,
  },
  card: {
    width: 150,
    backgroundColor: '#23242b',
    borderRadius: 16,
    margin: 10,
    padding: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  title: {
    color: '#ffe066',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  desc: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.8,
  },
  closeBtn: {
    marginTop: 12,
    backgroundColor: '#4ee6e6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  closeBtnText: {
    color: '#181A20',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StoryCatalogModal; 
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export type ArchiveArea = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  position: {
    x: number;
    y: number;
  };
  connections: string[];
  requiredEntries: number;
  currentEntries: number;
  theme: string;
  skillCategories: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
};

// Sample map data
const archiveAreas: ArchiveArea[] = [
  {
    id: 'entrance',
    name: 'The Entrance',
    description: 'Where your journey begins. A place of reflection and preparation.',
    unlocked: true,
    position: { x: 0.5, y: 0.1 },
    connections: ['garden', 'library'],
    requiredEntries: 0,
    currentEntries: 0,
    theme: 'reflection',
    skillCategories: ['Emotional Awareness'],
    difficulty: 'Beginner',
  },
  {
    id: 'garden',
    name: 'The Garden of Growth',
    description: 'A space for nurturing new ideas and personal development.',
    unlocked: false,
    position: { x: 0.3, y: 0.3 },
    connections: ['entrance', 'library', 'sanctuary'],
    requiredEntries: 5,
    currentEntries: 0,
    theme: 'growth',
    skillCategories: ['Stress Management', 'Emotional Awareness'],
    difficulty: 'Beginner',
  },
  {
    id: 'library',
    name: 'The Library of Memories',
    description: 'Where your experiences and insights are preserved.',
    unlocked: false,
    position: { x: 0.7, y: 0.3 },
    connections: ['entrance', 'garden', 'sanctuary', 'archive'],
    requiredEntries: 5,
    currentEntries: 0,
    theme: 'memory',
    skillCategories: ['Social Connection', 'Personal Growth'],
    difficulty: 'Beginner',
  },
  {
    id: 'sanctuary',
    name: 'The Inner Sanctuary',
    description: 'A peaceful space for deep reflection and healing.',
    unlocked: false,
    position: { x: 0.5, y: 0.5 },
    connections: ['garden', 'library', 'archive', 'summit'],
    requiredEntries: 10,
    currentEntries: 0,
    theme: 'healing',
    skillCategories: ['Self-Compassion', 'Stress Management'],
    difficulty: 'Intermediate',
  },
  {
    id: 'archive',
    name: 'The Deep Archive',
    description: 'Where profound insights and wisdom are stored.',
    unlocked: false,
    position: { x: 0.7, y: 0.7 },
    connections: ['library', 'sanctuary', 'summit'],
    requiredEntries: 15,
    currentEntries: 0,
    theme: 'wisdom',
    skillCategories: ['Personal Growth', 'Emotional Awareness'],
    difficulty: 'Intermediate',
  },
  {
    id: 'summit',
    name: 'The Summit of Understanding',
    description: 'The highest point of personal insight and growth.',
    unlocked: false,
    position: { x: 0.5, y: 0.9 },
    connections: ['sanctuary', 'archive'],
    requiredEntries: 20,
    currentEntries: 0,
    theme: 'enlightenment',
    skillCategories: ['Self-Compassion', 'Social Connection', 'Personal Growth'],
    difficulty: 'Advanced',
  },
];

type ArchiveMapModalProps = {
  visible: boolean;
  onClose: () => void;
  onAreaSelect: (area: ArchiveArea) => void;
  completedEntries: number;
  entries: Array<{
    type: string;
    content: string;
    prompt: string;
    skillCategory: string;
    mapArea: string;
    difficulty: string;
  }>;
};

const ArchiveMapModal = ({
  visible,
  onClose,
  onAreaSelect,
  completedEntries,
  entries,
}: ArchiveMapModalProps) => {
  const [selectedArea, setSelectedArea] = useState<ArchiveArea | null>(null);
  const [areas, setAreas] = useState<ArchiveArea[]>(archiveAreas);

  // Update area progress and unlock status based on entries
  useEffect(() => {
    const updatedAreas = areas.map(area => {
      const areaEntries = entries.filter(entry => entry.mapArea === area.id);
      const newCurrentEntries = areaEntries.length;
      const unlocked = newCurrentEntries >= area.requiredEntries;

      return {
        ...area,
        currentEntries: newCurrentEntries,
        unlocked: unlocked || area.id === 'entrance',
      };
    });

    setAreas(updatedAreas);
  }, [entries]);

  useEffect(() => {
    console.log('Modal visibility:', visible);
    if (!visible) {
      setSelectedArea(null);
    }
  }, [visible]);

  if (!visible) return null;

  const getAreaColor = (area: ArchiveArea) => {
    if (!area.unlocked) return '#333';
    switch (area.theme) {
      case 'reflection':
        return '#4ee6e6';
      case 'growth':
        return '#ffe066';
      case 'memory':
        return '#ff6b6b';
      case 'healing':
        return '#a29bfe';
      case 'wisdom':
        return '#6c5ce7';
      case 'enlightenment':
        return '#00b894';
      default:
        return '#4ee6e6';
    }
  };

  const renderConnections = () => {
    return archiveAreas.map((area) =>
      area.connections.map((connectedId) => {
        const connectedArea = archiveAreas.find((a) => a.id === connectedId);
        if (!connectedArea) return null;

        return (
          <View
            key={`${area.id}-${connectedId}`}
            style={[
              styles.connection,
              {
                left: area.position.x * width,
                top: area.position.y * height,
                width: Math.abs(
                  (connectedArea.position.x - area.position.x) * width
                ),
                height: Math.abs(
                  (connectedArea.position.y - area.position.y) * height
                ),
                transform: [
                  {
                    rotate:
                      Math.atan2(
                        connectedArea.position.y - area.position.y,
                        connectedArea.position.x - area.position.x
                      ) + 'rad',
                  },
                ],
              },
            ]}
          />
        );
      })
    );
  };

  const renderAreas = () => {
    return areas.map((area) => (
      <TouchableOpacity
        key={area.id}
        style={[
          styles.area,
          {
            left: area.position.x * width - 30,
            top: area.position.y * height - 30,
            backgroundColor: getAreaColor(area),
            opacity: area.unlocked ? 1 : 0.5,
          },
        ]}
        onPress={() => {
          if (area.unlocked) {
            setSelectedArea(area);
            onAreaSelect(area);
          }
        }}
      >
        <Ionicons
          name={area.unlocked ? 'location' : 'lock-closed'}
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    ));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>The Archive</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            {renderConnections()}
            {renderAreas()}
          </View>

          {selectedArea && (
            <View style={styles.areaInfo}>
              <Text style={styles.areaName}>{selectedArea.name}</Text>
              <Text style={styles.areaDescription}>
                {selectedArea.description}
              </Text>
              <View style={styles.skillCategories}>
                {selectedArea.skillCategories.map((skill, index) => (
                  <Text key={index} style={styles.skillCategory}>
                    {skill}
                  </Text>
                ))}
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Progress: {selectedArea.currentEntries}/{selectedArea.requiredEntries} entries
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(selectedArea.currentEntries / selectedArea.requiredEntries) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

          <View style={styles.stats}>
            <Text style={styles.statsText}>
              Total Entries: {completedEntries}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#ffe066',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  connection: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#333',
    transformOrigin: 'left center',
  },
  area: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  areaInfo: {
    padding: 20,
    backgroundColor: '#23242b',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  areaName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  areaDescription: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ee6e6',
    borderRadius: 2,
  },
  stats: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  skillCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  skillCategory: {
    backgroundColor: '#4ee6e6',
    color: '#000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ArchiveMapModal; 
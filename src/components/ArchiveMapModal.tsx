import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export type ArchiveArea = {
  id: string;
  name: string;
  description: string;
  requiredEntries: number;
  focus: 'awareness' | 'resilience' | 'connection' | 'balance';
  entries: CodexEntry[];
};

type CodexEntry = {
  id: string;
  type: string;
  content: string;
  prompt: string;
  skillCategory: string;
  mapArea: string;
  difficulty: string;
  timestamp: number;
};

interface ArchiveMapModalProps {
  visible: boolean;
  onClose: () => void;
  onAreaSelect: (area: ArchiveArea) => void;
  completedEntries: number;
  entries: CodexEntry[];
}

const areas: ArchiveArea[] = [
  {
    id: 'garden',
    name: 'Garden of Awareness',
    description: 'A peaceful space for mindfulness and self-reflection. Here you\'ll develop your awareness of thoughts, feelings, and patterns.',
    requiredEntries: 3,
    focus: 'awareness',
    entries: []
  },
  {
    id: 'sanctuary',
    name: 'Sanctuary of Resilience',
    description: 'A safe haven where you\'ll learn to bounce back from challenges and build emotional strength.',
    requiredEntries: 3,
    focus: 'resilience',
    entries: []
  },
  {
    id: 'grove',
    name: 'Grove of Connection',
    description: 'A welcoming space to explore relationships and social support systems.',
    requiredEntries: 3,
    focus: 'connection',
    entries: []
  },
  {
    id: 'summit',
    name: 'Summit of Balance',
    description: 'A place of harmony where you\'ll learn to maintain equilibrium in life\'s various aspects.',
    requiredEntries: 3,
    focus: 'balance',
    entries: []
  }
];

const ArchiveMapModal: React.FC<ArchiveMapModalProps> = ({
  visible,
  onClose,
  onAreaSelect,
  completedEntries,
  entries
}) => {
  const [selectedArea, setSelectedArea] = useState<ArchiveArea | null>(null);

  // Organize entries by area
  const areasWithEntries = areas.map(area => ({
    ...area,
    entries: entries.filter(entry => entry.mapArea === area.id)
  }));

  const isAreaUnlocked = (area: ArchiveArea) => {
    return area.entries.length >= area.requiredEntries;
  };

  const getAreaProgress = (area: ArchiveArea) => {
    return Math.min(100, (area.entries.length / area.requiredEntries) * 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Memory Archive</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.areasContainer}>
            {areasWithEntries.map(area => (
              <TouchableOpacity
                key={area.id}
                style={[
                  styles.areaCard,
                  !isAreaUnlocked(area) && styles.lockedArea
                ]}
                onPress={() => {
                  setSelectedArea(area);
                  onAreaSelect(area);
                }}
                disabled={!isAreaUnlocked(area)}
              >
                <View style={styles.areaHeader}>
                  <Text style={styles.areaName}>{area.name}</Text>
                  <Text style={styles.areaFocus}>Focus: {area.focus}</Text>
                </View>

                <Text style={styles.areaDescription}>{area.description}</Text>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${getAreaProgress(area)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {area.entries.length}/{area.requiredEntries} Entries
                  </Text>
                </View>

                {area.entries.length > 0 && (
                  <View style={styles.entriesContainer}>
                    <Text style={styles.entriesTitle}>Recent Reflections:</Text>
                    {area.entries.slice(-3).map(entry => (
                      <View key={entry.id} style={styles.entryItem}>
                        <Text style={styles.entryDate}>
                          {formatDate(entry.timestamp)}
                        </Text>
                        <Text style={styles.entryPrompt} numberOfLines={2}>
                          {entry.prompt}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#23242b',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  areasContainer: {
    flex: 1,
  },
  areaCard: {
    backgroundColor: '#1a1b1f',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  lockedArea: {
    opacity: 0.6,
  },
  areaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  areaName: {
    color: '#ffe066',
    fontSize: 18,
    fontWeight: 'bold',
  },
  areaFocus: {
    color: '#4ee6e6',
    fontSize: 14,
    fontStyle: 'italic',
  },
  areaDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ee6e6',
    borderRadius: 3,
  },
  progressText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'right',
  },
  entriesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
  },
  entriesTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  entryItem: {
    marginBottom: 8,
  },
  entryDate: {
    color: '#4ee6e6',
    fontSize: 12,
    marginBottom: 2,
  },
  entryPrompt: {
    color: '#ccc',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default ArchiveMapModal; 
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export type ArchiveArea = {
  id: string;
  roomNumber: number;
  name: string;
  description: string;
  requiredEntries: number;
  requiredStories: number;
  focus: 'awareness' | 'resilience' | 'connection' | 'balance';
  entries: CodexEntry[];
  isCurrentRoom?: boolean;
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
  currentRoomId: string;
}

const areas: ArchiveArea[] = [
  {
    id: 'garden',
    roomNumber: 101,
    name: 'Garden of Awareness',
    description: 'A peaceful space for mindfulness and self-reflection. Here you\'ll develop your awareness of thoughts, feelings, and patterns.',
    requiredEntries: 2,
    requiredStories: 1,
    focus: 'awareness',
    entries: []
  },
  {
    id: 'sanctuary',
    roomNumber: 102,
    name: 'Sanctuary of Resilience',
    description: 'A safe haven where you\'ll learn to bounce back from challenges and build emotional strength.',
    requiredEntries: 2,
    requiredStories: 1,
    focus: 'resilience',
    entries: []
  },
  {
    id: 'grove',
    roomNumber: 103,
    name: 'Grove of Connection',
    description: 'A welcoming space to explore relationships and social support systems.',
    requiredEntries: 2,
    requiredStories: 1,
    focus: 'connection',
    entries: []
  },
  {
    id: 'summit',
    roomNumber: 201,
    name: 'Summit of Balance',
    description: 'A place of harmony where you\'ll learn to maintain equilibrium in life\'s various aspects.',
    requiredEntries: 3,
    requiredStories: 2,
    focus: 'balance',
    entries: []
  },
  {
    id: 'archive',
    roomNumber: 202,
    name: 'Archive of Wisdom',
    description: 'A repository of ancient knowledge and insights, where you\'ll discover timeless wisdom.',
    requiredEntries: 3,
    requiredStories: 2,
    focus: 'awareness',
    entries: []
  },
  {
    id: 'sanctum',
    roomNumber: 203,
    name: 'Sanctum of Growth',
    description: 'A sacred space dedicated to personal development and transformation.',
    requiredEntries: 3,
    requiredStories: 2,
    focus: 'resilience',
    entries: []
  },
  {
    id: 'nexus',
    roomNumber: 301,
    name: 'Nexus of Understanding',
    description: 'A central hub where different perspectives converge and new insights emerge.',
    requiredEntries: 4,
    requiredStories: 3,
    focus: 'connection',
    entries: []
  },
  {
    id: 'haven',
    roomNumber: 302,
    name: 'Haven of Peace',
    description: 'A tranquil retreat where you\'ll find inner calm and emotional stability.',
    requiredEntries: 4,
    requiredStories: 3,
    focus: 'balance',
    entries: []
  },
  {
    id: 'chamber',
    roomNumber: 303,
    name: 'Chamber of Reflection',
    description: 'A quiet space for deep contemplation and meaningful insights.',
    requiredEntries: 4,
    requiredStories: 3,
    focus: 'awareness',
    entries: []
  }
];

const ArchiveMapModal: React.FC<ArchiveMapModalProps> = ({
  visible,
  onClose,
  onAreaSelect,
  completedEntries,
  entries,
  currentRoomId
}) => {
  const [selectedArea, setSelectedArea] = useState<ArchiveArea | null>(null);
  const windowWidth = Dimensions.get('window').width;
  const mapSize = Math.min(windowWidth * 0.9, 500);
  const tileSize = mapSize / 12;

  // Organize entries by area and mark current room
  const areasWithEntries = areas.map(area => ({
    ...area,
    entries: entries.filter(entry => entry.mapArea === area.id),
    isCurrentRoom: area.id === currentRoomId
  }));

  const isAreaUnlocked = (area: ArchiveArea) => {
    // First room (Garden of Awareness) is always unlocked
    if (area.roomNumber === 101) return true;
    
    const storyEntries = area.entries.filter(entry => entry.type === 'story').length;
    const journalEntries = area.entries.filter(entry => entry.type === 'journal').length;
    return storyEntries >= area.requiredStories && journalEntries >= area.requiredEntries;
  };

  const getAreaProgress = (area: ArchiveArea) => {
    const storyEntries = area.entries.filter(entry => entry.type === 'story').length;
    const journalEntries = area.entries.filter(entry => entry.type === 'journal').length;
    const storyProgress = (storyEntries / area.requiredStories) * 50;
    const journalProgress = (journalEntries / area.requiredEntries) * 50;
    return Math.min(100, storyProgress + journalProgress);
  };

  const renderLibraryElement = (x: number, y: number, width: number, height: number, type: 'bookshelf' | 'area' | 'path' | 'decoration', area?: ArchiveArea) => {
    const isUnlocked = area ? isAreaUnlocked(area) : false;
    const progress = area ? getAreaProgress(area) : 0;
    const isCurrentRoom = area?.isCurrentRoom;

    const elementStyles = [
      styles.libraryElement,
      {
        left: x * tileSize,
        top: y * tileSize,
        width: width * tileSize,
        height: height * tileSize,
      },
      type === 'bookshelf' && styles.bookshelf,
      type === 'path' && styles.path,
      type === 'decoration' && styles.decoration,
      type === 'area' && styles.area,
      !isUnlocked && type === 'area' && styles.lockedArea,
      isCurrentRoom && type === 'area' && styles.currentRoom,
    ];

    if (type === 'area' && area) {
      return (
        <TouchableOpacity
          key={`${x}-${y}`}
          style={elementStyles}
          onPress={() => {
            if (isUnlocked) {
              setSelectedArea(area);
              onAreaSelect(area);
            }
          }}
          disabled={!isUnlocked}
        >
          <View style={styles.areaContent}>
            <Text style={styles.areaName} numberOfLines={2}>
              {area.name}
            </Text>
            {isCurrentRoom ? (
              <View style={styles.currentRoomIndicator}>
                <Text style={styles.playerEmoji} accessibilityLabel="You are here">🧍</Text>
                <Text style={styles.youAreHereText}>You are here</Text>
              </View>
            ) : isUnlocked ? (
              <Text style={styles.unlockedEmoji} accessibilityLabel="Unlocked">📖</Text>
            ) : (
              <Text style={styles.lockedEmoji} accessibilityLabel="Locked">🔒</Text>
            )}
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progress}%` }
                ]} 
              />
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return <View key={`${x}-${y}`} style={elementStyles} />;
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
            <Text style={styles.title}>The Ancient Archive</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={{color: '#fff', fontSize: 24}}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <Text style={styles.playerEmoji} accessibilityLabel="You are here">🧍</Text>
              <Text style={styles.legendText}>Current Room</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.unlockedEmoji} accessibilityLabel="Unlocked">📖</Text>
              <Text style={styles.legendText}>Unlocked</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.lockedEmoji} accessibilityLabel="Locked">🔒</Text>
              <Text style={styles.legendText}>Locked</Text>
            </View>
          </View>

          <View style={[styles.mapContainer, { width: mapSize, height: mapSize }]}>
            {/* Bookshelves and walls - creating an organic shape */}
            {renderLibraryElement(0, 0, 12, 1, 'bookshelf')}
            {renderLibraryElement(0, 0, 1, 12, 'bookshelf')}
            {renderLibraryElement(11, 0, 1, 12, 'bookshelf')}
            {renderLibraryElement(0, 11, 12, 1, 'bookshelf')}
            
            {/* Decorative elements - creating atmosphere */}
            {renderLibraryElement(1, 1, 1, 1, 'decoration')}
            {renderLibraryElement(10, 1, 1, 1, 'decoration')}
            {renderLibraryElement(1, 10, 1, 1, 'decoration')}
            {renderLibraryElement(10, 10, 1, 1, 'decoration')}
            {renderLibraryElement(5, 5, 1, 1, 'decoration')}
            {renderLibraryElement(3, 3, 1, 1, 'decoration')}
            {renderLibraryElement(7, 3, 1, 1, 'decoration')}
            {renderLibraryElement(3, 7, 1, 1, 'decoration')}
            {renderLibraryElement(7, 7, 1, 1, 'decoration')}
            {renderLibraryElement(5, 1, 1, 1, 'decoration')}
            {renderLibraryElement(5, 10, 1, 1, 'decoration')}
            {renderLibraryElement(1, 5, 1, 1, 'decoration')}
            {renderLibraryElement(10, 5, 1, 1, 'decoration')}

            {/* Paths - creating winding corridors with interesting intersections */}
            {renderLibraryElement(2, 1, 1, 3, 'path')}
            {renderLibraryElement(3, 3, 6, 1, 'path')}
            {renderLibraryElement(8, 1, 1, 3, 'path')}
            {renderLibraryElement(2, 8, 1, 3, 'path')}
            {renderLibraryElement(3, 8, 6, 1, 'path')}
            {renderLibraryElement(8, 8, 1, 3, 'path')}
            {renderLibraryElement(4, 4, 4, 1, 'path')}
            {renderLibraryElement(5, 5, 1, 3, 'path')}
            {renderLibraryElement(3, 6, 1, 1, 'path')}
            {renderLibraryElement(7, 6, 1, 1, 'path')}
            {renderLibraryElement(2, 4, 1, 1, 'path')}
            {renderLibraryElement(9, 4, 1, 1, 'path')}
            {renderLibraryElement(4, 2, 1, 1, 'path')}
            {renderLibraryElement(7, 2, 1, 1, 'path')}
            {renderLibraryElement(4, 9, 1, 1, 'path')}
            {renderLibraryElement(7, 9, 1, 1, 'path')}

            {/* Areas - placed organically around the map */}
            {renderLibraryElement(1, 1, 2, 2, 'area', areasWithEntries[0])} {/* Garden - Top Left */}
            {renderLibraryElement(9, 1, 2, 2, 'area', areasWithEntries[1])} {/* Sanctuary - Top Right */}
            {renderLibraryElement(1, 9, 2, 2, 'area', areasWithEntries[2])} {/* Grove - Bottom Left */}
            {renderLibraryElement(9, 9, 2, 2, 'area', areasWithEntries[3])} {/* Summit - Bottom Right */}
            {renderLibraryElement(4, 2, 3, 2, 'area', areasWithEntries[4])} {/* Archive - Top Center */}
            {renderLibraryElement(4, 7, 3, 2, 'area', areasWithEntries[5])} {/* Sanctum - Bottom Center */}
            {renderLibraryElement(2, 4, 2, 3, 'area', areasWithEntries[6])} {/* Nexus - Left Center */}
            {renderLibraryElement(8, 4, 2, 3, 'area', areasWithEntries[7])} {/* Haven - Right Center */}
            {renderLibraryElement(5, 5, 2, 2, 'area', areasWithEntries[8])} {/* Chamber - Center */}
          </View>

          {selectedArea && (
            <View style={styles.areaInfo}>
              <Text style={styles.areaName}>Room {selectedArea.roomNumber}: {selectedArea.name}</Text>
              <Text style={styles.areaDescription}>{selectedArea.description}</Text>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Stories: {selectedArea.entries.filter(e => e.type === 'story').length}/{selectedArea.requiredStories}
                </Text>
                <Text style={styles.progressText}>
                  Journal Entries: {selectedArea.entries.filter(e => e.type === 'journal').length}/{selectedArea.requiredEntries}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${getAreaProgress(selectedArea)}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 'auto',
    maxWidth: 520,
    minWidth: 340,
    height: 'auto',
    maxHeight: 650,
    backgroundColor: '#1a1b1f',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingBottom: 10,
  },
  title: {
    color: '#ffe066',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  closeButton: {
    padding: 5,
  },
  mapContainer: {
    position: 'relative',
    backgroundColor: '#23242b',
    borderWidth: 2,
    borderColor: '#333',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  libraryElement: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#333',
  },
  bookshelf: {
    backgroundColor: '#2a1f1f',
    borderColor: '#3a2f2f',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  path: {
    backgroundColor: '#2a2b30',
    borderColor: '#3a3b40',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  decoration: {
    backgroundColor: '#2a2b30',
    borderColor: '#3a3b40',
    opacity: 0.5,
    borderRadius: 2,
    shadowColor: '#ffe066',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  area: {
    backgroundColor: '#2a2b30',
    borderColor: '#3a3b40',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lockedArea: {
    backgroundColor: '#1a1b1f',
    opacity: 0.7,
    shadowColor: '#666',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  areaContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: '#ffe066',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  areaName: {
    color: '#ffe066',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'serif',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    width: '100%',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ee6e6',
    borderRadius: 2,
  },
  areaInfo: {
    backgroundColor: '#23242b',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  areaDescription: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 24,
    fontFamily: 'serif',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressText: {
    color: '#4ee6e6',
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'serif',
  },
  currentRoom: {
    borderColor: '#ffe066',
    borderWidth: 2,
    shadowColor: '#ffe066',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: '#2a2b30',
  },
  currentRoomIndicator: {
    alignItems: 'center',
    marginVertical: 4,
    position: 'relative',
  },
  playerEmoji: {
    fontSize: 32,
    marginBottom: 2,
    textShadowColor: '#ffe066',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  unlockedEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  lockedEmoji: {
    fontSize: 24,
    marginBottom: 2,
    opacity: 0.7,
  },
  youAreHereText: {
    color: '#ffe066',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'serif',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontWeight: 'bold',
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    minWidth: 320,
    maxWidth: 420,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendText: {
    color: '#ccc',
    marginLeft: 5,
    fontSize: 12,
  },
});

export default ArchiveMapModal; 
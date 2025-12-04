import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { DIFFICULTY_LEVELS } from '../../../../data/archivePaths';
import { GameData } from '../../../../types/user';
import { styles } from '../styles';

interface StartScreenProps {
  theme: any;
  isLoadingGameData: boolean;
  apiGameData: GameData | null;
  selectedDifficulty: string;
  onStartGame: () => void;
  onSelectDifficulty: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  theme,
  isLoadingGameData,
  apiGameData,
  selectedDifficulty,
  onStartGame,
  onSelectDifficulty,
}) => {
  return (
    <View style={[styles.startScreen, { backgroundColor: theme.theme.archiveBackground }]}>
      <Text style={styles.startTitle}>Light your way through the darkness</Text>

      {/* Loading indicator */}
      {isLoadingGameData && (
        <Text style={styles.startInstructionText}>
          ⏳ Loading your progress...
        </Text>
      )}

      {/* Display current score if available */}
      {apiGameData && (
        <View style={{ marginBottom: 12, alignItems: 'center' }}>
          <Text style={{ color: '#d4af37', fontSize: 14, fontWeight: 'bold' }}>
            Current Score: {apiGameData.score || 0} | Level: {apiGameData.level || 1}
          </Text>
          {apiGameData.personality_data && (
            <Text style={{ color: '#4ee6e6', fontSize: 11, fontStyle: 'italic', marginTop: 4 }}>
              Personality-based thoughts active
            </Text>
          )}
        </View>
      )}

      <View style={styles.startInstructions}>
        <Text style={styles.startInstructionText}>
          📚 In this wing, loose thoughts slip from the shelves. Some are shadows, some are anchors.
        </Text>
        <Text style={styles.startInstructionText}>
          🛡️ Touch and drag the golden shield at the bottom to move it left and right.
        </Text>
        <Text style={styles.startInstructionText}>
          ⚡ Tap anywhere to shoot bolts upward. Tap the shield to shoot while moving!
        </Text>
        <Text style={styles.startInstructionText}>
          💚 Tap green thoughts directly to welcome them in. They grant power-ups and help steady you.
        </Text>
        <Text style={[styles.startInstructionText, { color: '#ff0041' }]}>
          ⚠️ Letting red thoughts reach the bottom costs lives. Firing wildly wastes energy and lowers your score.
        </Text>
        <Text style={styles.startInstructionText}>
          🏆 Clear enough thoughts to complete each wave. Survive all levels to restore this shelf of The Archive.
        </Text>
      </View>

      <Text style={styles.startSubtitle}>CURRENT DIFFICULTY:</Text>
      <Text style={styles.startSubtitle}>
        {DIFFICULTY_LEVELS[selectedDifficulty].icon}{DIFFICULTY_LEVELS[selectedDifficulty].name}
      </Text>

      <TouchableOpacity 
        style={styles.startButton} 
        onPress={onStartGame}
        activeOpacity={0.8}
        disabled={isLoadingGameData}
      >
        <Text style={styles.startButtonText}>🚀 START GAME 🚀</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.difficultySelectButton}
        onPress={onSelectDifficulty}
        activeOpacity={0.8}
        disabled={isLoadingGameData}
      >
        <Text style={styles.difficultySelectButtonText}>🎯SELECT DIFFICULTY🎯</Text>
      </TouchableOpacity>

      <Text style={styles.startHint}>
        Tap to begin your mental defense!
      </Text>
    </View>
  );
};


import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { DIFFICULTY_LEVELS } from '../../../../data/archivePaths';
import { useDDA } from '../../../../hooks/useDDA';
import { styles } from '../styles';

interface DifficultySelectProps {
  selectedDifficulty: string;
  onSelectDifficulty: (difficulty: string) => void;
  onStartGame: () => void;
  onBack: () => void;
}

export const DifficultySelect: React.FC<DifficultySelectProps> = ({
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  onBack,
}) => {
  const { ddaState } = useDDA();

  return (
    <View style={styles.difficultyScreen}>
      <Text style={styles.difficultyTitle}>SELECT DIFFICULTY</Text>
      
      {!ddaState.isFirstGame && ddaState.lastResult && (
        <View style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#4ee6e6'
        }}>
          <Text style={{
            color: '#4ee6e6',
            fontSize: 14,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 8
          }}>
            🧠 Adaptive Difficulty Active
          </Text>
          <Text style={{
            color: '#ccc',
            fontSize: 12,
            textAlign: 'center',
            marginBottom: 4
          }}>
            Games played: {ddaState.gamesPlayed}
          </Text>
          <Text style={{
            color: '#ccc',
            fontSize: 12,
            textAlign: 'center',
            marginBottom: 4
          }}>
            Difficulty: {(ddaState.lastResult.difficulty * 100).toFixed(1)}% | 
            Ease: {(ddaState.lastResult.ease * 100).toFixed(1)}%
          </Text>
          <Text style={{
            color: '#FCD34D',
            fontSize: 11,
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {ddaState.lastResult.adjustmentReason}
          </Text>
        </View>
      )}
      
      <View style={styles.difficultyOptionsContainer}>
        <ScrollView 
          style={styles.difficultyOptions}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {Object.entries(DIFFICULTY_LEVELS).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.difficultyOption,
                selectedDifficulty === key && styles.selectedDifficulty
              ]}
              onPress={() => onSelectDifficulty(key)}
              activeOpacity={0.8}
            >
              <Text style={styles.difficultyName}>{config.icon}{config.name}</Text>
              
              <View style={styles.difficultyStats}>
                <Text style={styles.difficultyStatText}>
                  Speed: {(config.modifiers.thoughtSpeed * 100).toFixed(0)}%
                </Text>
                <Text style={styles.difficultyStatText}>
                  Lives: {config.modifiers.livesStart}
                </Text>
                <Text style={styles.difficultyStatText}>
                  Score: {(config.modifiers.scoreMultiplier * 100).toFixed(0)}%
                </Text>
              </View>
              
              <Text style={{
                color: '#FCD34D',
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'center',
                marginTop: 4
              }}>
                Win: {config.modifiers.maxLevels} levels
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.difficultyButtonsContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={onStartGame}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>
            START {DIFFICULTY_LEVELS[selectedDifficulty].name}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


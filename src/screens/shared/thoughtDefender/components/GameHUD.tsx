import React from 'react';
import { Text, View } from 'react-native';
import { DIFFICULTY_LEVELS } from '../../../../data/archivePaths';
import { DifficultyConfig } from '../../../../types/index';
import { styles } from '../styles';

interface GameHUDProps {
  score: number;
  lives: number;
  maxHudLives: number;
  level: number;
  thoughtsCleared: number;
  currentWaveTarget: number;
  shotsFired: number;
  hits: number;
  selectedDifficulty: string;
  getDifficultyConfig: () => DifficultyConfig;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  lives,
  maxHudLives,
  level,
  thoughtsCleared,
  currentWaveTarget,
  shotsFired,
  hits,
  selectedDifficulty,
  getDifficultyConfig,
}) => {
  const accuracy = shotsFired > 0 ? hits / shotsFired : 0;

  return (
    <View style={styles.hud}>
      <View style={styles.hudItem}>
        <Text style={styles.hudLabel}>SCORE</Text>
        <Text style={styles.hudValue}>
          {score.toString().padStart(6, "0")}
        </Text>
      </View>
      <View style={styles.hudItem}>
        <Text style={styles.hudLabel}>LIVES</Text>
        <Text style={styles.hudValue}>
          {"♥".repeat(Math.max(0, lives))}
          {"♡".repeat(Math.max(0, maxHudLives - lives))}
        </Text>
      </View>
      <View style={styles.hudItem}>
        <Text style={styles.hudLabel}>LEVEL</Text>
        <Text style={[
          styles.hudValue,
          level >= getDifficultyConfig().modifiers.maxLevels && { color: '#FCD34D', fontWeight: 'bold' }
        ]}>
          {level}/{getDifficultyConfig().modifiers.maxLevels}
          {level >= getDifficultyConfig().modifiers.maxLevels && ' 🏆'}
        </Text>
      </View>
      <View style={styles.hudItem}>
        <Text style={styles.hudLabel}>PROGRESS</Text>
        <Text style={styles.hudValue}>
          {thoughtsCleared}/{currentWaveTarget}
        </Text>
      </View>
      <View style={styles.hudItem}>
        <Text style={styles.hudLabel}>ACCURACY</Text>
        <Text style={[
          styles.hudValue,
          { 
            color: shotsFired > 0 
              ? accuracy >= 0.7 ? '#00ff41' 
                : accuracy >= 0.5 ? '#FCD34D' 
                : '#ff0041'
              : '#ffffff'
          }
        ]}>
          {shotsFired > 0 ? `${Math.round(accuracy * 100)}%` : '--'}
        </Text>
      </View>
      <View style={styles.hudItem}>
        <Text style={styles.hudLabel}>DIFFICULTY</Text>
        <Text style={styles.hudValue}>{DIFFICULTY_LEVELS[selectedDifficulty].icon}</Text>
      </View>
    </View>
  );
};


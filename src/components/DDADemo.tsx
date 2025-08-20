import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { convertGameDataToPerformance, useDDA } from '../hooks/useDDA';

export const DDADemo: React.FC = () => {
  const { ddaState, calculateDifficulty, updateBaseline, resetDDA } = useDDA();
  const [testResults, setTestResults] = useState<any[]>([]);

  const runTestScenario = (scenario: string, performance: any) => {
    const result = calculateDifficulty(performance);
    updateBaseline(performance);
    
    setTestResults(prev => [...prev, {
      scenario,
      performance,
      result,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testScenarios = [
    {
      name: "Beginner Player",
      performance: convertGameDataToPerformance(
        150, // score
        1,   // level
        false, // won
        8,   // thoughtsCleared
        12,  // totalThoughts
        45,  // survivalTime
        Date.now() - 45000, // gameStartTime
        Date.now() // gameEndTime
      )
    },
    {
      name: "Skilled Player",
      performance: convertGameDataToPerformance(
        450, // score
        3,   // level
        true, // won
        25,  // thoughtsCleared
        30,  // totalThoughts
        120, // survivalTime
        Date.now() - 120000, // gameStartTime
        Date.now() // gameEndTime
      )
    },
    {
      name: "Struggling Player",
      performance: convertGameDataToPerformance(
        50,  // score
        1,   // level
        false, // won
        3,   // thoughtsCleared
        15,  // totalThoughts
        20,  // survivalTime
        Date.now() - 20000, // gameStartTime
        Date.now() // gameEndTime
      )
    },
    {
      name: "Expert Player",
      performance: convertGameDataToPerformance(
        800, // score
        5,   // level
        true, // won
        40,  // thoughtsCleared
        45,  // totalThoughts
        180, // survivalTime
        Date.now() - 180000, // gameStartTime
        Date.now() // gameEndTime
      )
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧠 DDA Framework Demo</Text>
      
      {/* Current DDA State */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current DDA State</Text>
        <Text style={styles.text}>Games Played: {ddaState.gamesPlayed}</Text>
        <Text style={styles.text}>Is First Game: {ddaState.isFirstGame ? 'Yes' : 'No'}</Text>
        {ddaState.baseline && (
          <View style={styles.baselineInfo}>
            <Text style={styles.text}>Baseline Action Count: {ddaState.baseline.baselineActionCount.toFixed(1)}</Text>
            <Text style={styles.text}>Baseline Duration: {ddaState.baseline.baselineDuration.toFixed(0)}ms</Text>
            <Text style={styles.text}>Best First Level Score: {ddaState.baseline.bestFirstLevelScore}</Text>
            <Text style={styles.text}>Expected Performance: {ddaState.baseline.expectedPerformance.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* Test Scenarios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Scenarios</Text>
        {testScenarios.map((scenario, index) => (
          <TouchableOpacity
            key={index}
            style={styles.testButton}
            onPress={() => runTestScenario(scenario.name, scenario.performance)}
          >
            <Text style={styles.testButtonText}>{scenario.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Test Results */}
      {testResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          {testResults.map((result, index) => (
            <View key={index} style={styles.resultCard}>
              <Text style={styles.resultTitle}>{result.scenario} ({result.timestamp})</Text>
              <Text style={styles.resultText}>
                Difficulty: {(result.result.difficulty * 100).toFixed(1)}%
              </Text>
              <Text style={styles.resultText}>
                Ease: {(result.result.ease * 100).toFixed(1)}%
              </Text>
              <Text style={styles.resultText}>
                RPD: {(result.result.rpd * 100).toFixed(1)}%
              </Text>
              <Text style={styles.resultText}>
                Performance Ratio: {result.result.performanceRatio.toFixed(2)}
              </Text>
              <Text style={styles.resultText}>
                Recommendation: {result.result.recommendedAdjustment}
              </Text>
              <Text style={styles.resultReason}>{result.result.adjustmentReason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={resetDDA}>
        <Text style={styles.resetButtonText}>Reset DDA System</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0b0f',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ee6e6',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  baselineInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
  },
  testButton: {
    backgroundColor: '#4ee6e6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  testButtonText: {
    color: '#0a0b0f',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ee6e6',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 2,
  },
  resultReason: {
    fontSize: 11,
    color: '#FCD34D',
    fontStyle: 'italic',
    marginTop: 4,
  },
  resetButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ThoughtDefenderContentProps {
  onClose: () => void;
  onScoreUpdate: (data: any) => void;
  onStartGame: () => void;
}

export const ThoughtDefenderContent: React.FC<ThoughtDefenderContentProps> = ({
  onClose,
  onScoreUpdate,
  onStartGame
}) => {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: '#4ee6e6', fontSize: 24, fontWeight: 'bold' }}>⚡ Thought Defender</Text>
        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
          <Text style={{ color: '#4ee6e6', fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ flex: 1, backgroundColor: '#23242b', borderRadius: 12, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
          🧠 Mind Defense Training
        </Text>
        <Text style={{ color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
          Strengthen your mental resilience by defending against negative thoughts and collecting positive power-ups.
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 24 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🛡️</Text>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Defend</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>⚡</Text>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Survive</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#4ee6e6', 
            paddingHorizontal: 32, 
            paddingVertical: 16, 
            borderRadius: 8,
            shadowColor: '#4ee6e6',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5
          }}
          onPress={onStartGame}
        >
          <Text style={{ 
            color: '#0a0b0f', 
            fontSize: 18, 
            fontWeight: 'bold' 
          }}>
            Start Training
          </Text>
        </TouchableOpacity>
        
        <Text style={{ color: '#ccc', fontSize: 12, textAlign: 'center', marginTop: 16, fontStyle: 'italic' }}>
          Complete waves to strengthen your mind and unlock new abilities.
        </Text>
      </View>
    </View>
  );
};

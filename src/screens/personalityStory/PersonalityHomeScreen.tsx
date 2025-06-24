import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';
import { apiBaseUrl } from '../../services/apiConfig';

// Import components from your existing GameHomeScreen
import ArchiveMapModal from '../../components/ArchiveMapModal';
import Button from '../../components/Button';
import CodexModal from '../../components/CodexModal';
import EquipmentModal from '../../components/EquipmentModal';
import PixelButton from '../../components/PixelButton';
import GrimoireCatalogModal, { Grimoire } from '../../screens/characterStory/StoryCatalogScreen';

interface PersonalityTrait {
  name: string;
  score: number;
  description: string;
  archiveTitle: string;
  narrativeDescription: string;
  copingTools: CopingTool[];
  storyPrompts: string[];
  archiveSection: string;
  wellnessStats: {
    awareness: number;
    resilience: number;
    connection: number;
    balance: number;
  };
}

interface CopingTool {
  name: string;
  description: string;
  type: 'breathing' | 'grounding' | 'cognitive' | 'social' | 'creative';
  effectiveness: number;
  equipmentType?: 'focus' | 'comfort' | 'shield' | 'ground';
}

// Testing/Development Mode - Preset Personality Profiles for Quick Switching
const TEST_PERSONALITY_PROFILES: Record<string, Record<string, number>> = {
  'High Openness': { Openness: 9, Conscientiousness: 4, Extraversion: 6, Agreeableness: 7, Neuroticism: 3 },
  'High Conscientiousness': { Openness: 5, Conscientiousness: 9, Extraversion: 4, Agreeableness: 6, Neuroticism: 2 },
  'High Extraversion': { Openness: 7, Conscientiousness: 6, Extraversion: 9, Agreeableness: 8, Neuroticism: 2 },
  'High Agreeableness': { Openness: 6, Conscientiousness: 7, Extraversion: 4, Agreeableness: 9, Neuroticism: 4 },
  'High Neuroticism': { Openness: 5, Conscientiousness: 3, Extraversion: 2, Agreeableness: 6, Neuroticism: 8 }
};

// Personality-specific "character builds" with wellness stat bonuses
const PERSONALITY_BUILDS: Record<string, {
  title: string;
  class: string;
  description: string;
  baseStats: { awareness: number; resilience: number; connection: number; balance: number };
  preferredTools: string[];
  storyCategories: string[];
}> = {
  Openness: {
    title: 'The Sage Explorer',
    class: 'Creative Pathfinder',
    description: 'Masters the art of perspective and boundless curiosity',
    baseStats: { awareness: 8, resilience: 6, connection: 6, balance: 5 },
    preferredTools: ['Creative Visualization', 'Artistic Expression', 'Mindful Exploration'],
    storyCategories: ['Mystery', 'Discovery', 'Innovation']
  },
  Conscientiousness: {
    title: 'The Methodical Guardian',
    class: 'Structured Keeper',
    description: 'Builds strength through order and disciplined practice',
    baseStats: { awareness: 6, resilience: 8, connection: 5, balance: 7 },
    preferredTools: ['Structured Breathing', 'Goal Setting', 'Time Management'],
    storyCategories: ['Challenge', 'Growth', 'Achievement']
  },
  Extraversion: {
    title: 'The Social Catalyst',
    class: 'Community Builder',
    description: 'Draws power from connection and shared experiences',
    baseStats: { awareness: 6, resilience: 6, connection: 8, balance: 6 },
    preferredTools: ['Social Support', 'Group Activities', 'Verbal Processing'],
    storyCategories: ['Adventure', 'Cooperation', 'Leadership']
  },
  Agreeableness: {
    title: 'The Harmonious Healer',
    class: 'Empathic Guide',
    description: 'Transforms conflict into understanding and growth',
    baseStats: { awareness: 7, resilience: 5, connection: 8, balance: 7 },
    preferredTools: ['Compassionate Self-Talk', 'Boundary Setting', 'Loving-Kindness'],
    storyCategories: ['Healing', 'Relationships', 'Harmony']
  },
  Neuroticism: {
    title: 'The Depth Walker',
    class: 'Emotional Alchemist',
    description: 'Transforms sensitivity into profound wisdom',
    baseStats: { awareness: 8, resilience: 5, connection: 6, balance: 5 },
    preferredTools: ['Emotional Regulation', 'Storm Grounding', 'Reflective Writing'],
    storyCategories: ['Transformation', 'Inner Journey', 'Resilience']
  }
};

// Enhanced coping tools that map to equipment system
const PERSONALITY_COPING_TOOLS: Record<string, CopingTool[]> = {
  Openness: [
    {
      name: 'Creative Visualization',
      description: 'Transform stress into abstract art in your mind',
      type: 'creative',
      effectiveness: 5,
      equipmentType: 'focus'
    },
    {
      name: 'Perspective Journal',
      description: 'Record different viewpoints on challenging situations',
      type: 'cognitive',
      effectiveness: 4,
      equipmentType: 'comfort'
    },
    {
      name: 'Curiosity Shield',
      description: 'Use wonder and questions to deflect negative thoughts',
      type: 'cognitive',
      effectiveness: 4,
      equipmentType: 'shield'
    }
  ],
  Conscientiousness: [
    {
      name: 'Structured Breathing',
      description: 'Follow precise breathing patterns for inner order',
      type: 'breathing',
      effectiveness: 5,
      equipmentType: 'focus'
    },
    {
      name: 'Achievement Tracker',
      description: 'Break goals into manageable, trackable steps',
      type: 'cognitive',
      effectiveness: 4,
      equipmentType: 'comfort'
    },
    {
      name: 'Routine Anchor',
      description: 'Maintain stability through consistent daily practices',
      type: 'grounding',
      effectiveness: 4,
      equipmentType: 'ground'
    }
  ],
  Extraversion: [
    {
      name: 'Social Energy Boost',
      description: 'Connect with others for mutual support and energy',
      type: 'social',
      effectiveness: 5,
      equipmentType: 'comfort'
    },
    {
      name: 'Community Shield',
      description: 'Draw strength from your support network',
      type: 'social',
      effectiveness: 4,
      equipmentType: 'shield'
    },
    {
      name: 'Active Grounding',
      description: 'Use movement and activity to center yourself',
      type: 'grounding',
      effectiveness: 4,
      equipmentType: 'ground'
    }
  ],
  Agreeableness: [
    {
      name: 'Self-Compassion Practice',
      description: 'Treat yourself with the kindness you show others',
      type: 'cognitive',
      effectiveness: 5,
      equipmentType: 'focus'
    },
    {
      name: 'Boundary Visualization',
      description: 'Create healthy emotional boundaries while staying open',
      type: 'grounding',
      effectiveness: 4,
      equipmentType: 'shield'
    },
    {
      name: 'Harmony Ritual',
      description: 'Find balance between helping others and self-care',
      type: 'grounding',
      effectiveness: 4,
      equipmentType: 'ground'
    }
  ],
  Neuroticism: [
    {
      name: 'Emotional Storm Anchor',
      description: 'Ground yourself when emotions feel overwhelming',
      type: 'grounding',
      effectiveness: 5,
      equipmentType: 'ground'
    },
    {
      name: 'Sensitivity Shield',
      description: 'Transform emotional sensitivity into strength',
      type: 'cognitive',
      effectiveness: 4,
      equipmentType: 'shield'
    },
    {
      name: 'Depth Meditation',
      description: 'Use your emotional awareness for profound insights',
      type: 'breathing',
      effectiveness: 4,
      equipmentType: 'focus'
    }
  ]
};

export default function EnhancedPersonalityHomeScreen() {
  const { styles, theme } = useTheme();
  const { onboardingState } = useOnboarding();
  const { authToken } = useAuth();
  
  // State from original personality screen
  const [primaryTrait, setPrimaryTrait] = useState<string>('Openness');
  const [traitScores, setTraitScores] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyPrompt, setDailyPrompt] = useState<string>('');
  
  // State from game screen
  const [wellnessStats, setWellnessStats] = useState([
    { icon: '🧘', label: 'AWR', value: 5, color: '#4A90E2' },
    { icon: '💚', label: 'RES', value: 5, color: '#2ECC71' },
    { icon: '🤝', label: 'CON', value: 5, color: '#E74C3C' },
    { icon: '⚖️', label: 'BAL', value: 5, color: '#F39C12' },
  ]);
  
  const [isEquipmentModalVisible, setIsEquipmentModalVisible] = useState(false);
  const [isStoryCatalogVisible, setIsStoryCatalogVisible] = useState(false);
  const [isCodexVisible, setIsCodexVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);

  // Testing Mode State
  const [testingMode, setTestingMode] = useState(false);
  const [originalData, setOriginalData] = useState<{
    trait: string;
    scores: Record<string, number>;
    stats: any[];
  } | null>(null);
  const [titleTapCount, setTitleTapCount] = useState(0);

  // Get current personality build
  const currentBuild = PERSONALITY_BUILDS[primaryTrait];
  const currentTools = PERSONALITY_COPING_TOOLS[primaryTrait] || [];

  // Personality-based story prompts
  const storyPrompts: Record<string, string[]> = {
    Openness: [
      'A mysterious book appears with pages that change as you read...',
      'You discover a door that leads to impossible places...',
      'An ancient artifact begins responding to your curiosity...'
    ],
    Conscientiousness: [
      'The Archive\'s system has fallen into chaos - only you can restore order...',
      'A complex puzzle blocks the path to hidden knowledge...',
      'You must organize scattered memories into meaningful patterns...'
    ],
    Extraversion: [
      'Fellow travelers need your help navigating The Archive together...',
      'A gathering of minds seeks someone to unite their scattered wisdom...',
      'Your energy could awaken dormant connections between lost stories...'
    ],
    Agreeableness: [
      'Two conflicting memories need someone to find the harmony between them...',
      'A wounded soul in The Archive seeks understanding and healing...',
      'Your compassion could bridge an ancient divide...'
    ],
    Neuroticism: [
      'The Archive\'s emotional storms are rising - your depth could calm them...',
      'A mirror shows not your reflection, but your hidden strengths...',
      'Your sensitivity reveals truths others cannot perceive...'
    ]
  };

  useEffect(() => {
    const fetchPersonalityProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if we have an auth token
        if (!authToken) {
          console.log('No auth token available, using fallback data');
          // Use fallback data for testing
          const fallbackScores = { Openness: 7, Conscientiousness: 6, Extraversion: 5, Agreeableness: 8, Neuroticism: 4 };
          setTraitScores(fallbackScores);
          setPrimaryTrait('Agreeableness');
          setWellnessStats([
            { icon: '🧘', label: 'AWR', value: 7, color: '#4A90E2' },
            { icon: '💚', label: 'RES', value: 5, color: '#2ECC71' },
            { icon: '🤝', label: 'CON', value: 8, color: '#E74C3C' },
            { icon: '⚖️', label: 'BAL', value: 7, color: '#F39C12' },
          ]);
          setDailyPrompt('Your compassion could bridge an ancient divide...');
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${apiBaseUrl}users/me/`, {
          headers: { Authorization: `Token ${authToken}` }
        });

        const personalityProfile = response.data.personality_profile;
        
        if (personalityProfile) {
          const scores: Record<string, number> = {
            Openness: personalityProfile.openness,
            Conscientiousness: personalityProfile.conscientiousness,
            Extraversion: personalityProfile.extraversion,
            Agreeableness: personalityProfile.agreeableness,
            Neuroticism: personalityProfile.neuroticism
          };
          
          setTraitScores(scores);
          
          // Find primary trait
          const primary = Object.entries(scores).reduce((a, b) => 
            (scores[a[0]] || 0) > (scores[b[0]] || 0) ? a : b
          )[0] as keyof typeof PERSONALITY_BUILDS;
          
          setPrimaryTrait(primary);
          
          // Set personality-based wellness stats
          const build = PERSONALITY_BUILDS[primary];
          if (build) {
            setWellnessStats([
              { icon: '🧘', label: 'AWR', value: build.baseStats.awareness, color: '#4A90E2' },
              { icon: '💚', label: 'RES', value: build.baseStats.resilience, color: '#2ECC71' },
              { icon: '🤝', label: 'CON', value: build.baseStats.connection, color: '#E74C3C' },
              { icon: '⚖️', label: 'BAL', value: build.baseStats.balance, color: '#F39C12' },
            ]);
          }
          
          // Set daily prompt
          const prompts = storyPrompts[primary] || storyPrompts.Openness;
          setDailyPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
        }
      } catch (err) {
        console.error('Error fetching personality data:', err);
        // Use fallback data instead of showing error
        const fallbackScores = { Openness: 7, Conscientiousness: 6, Extraversion: 5, Agreeableness: 8, Neuroticism: 4 };
        setTraitScores(fallbackScores);
        setPrimaryTrait('Agreeableness');
        setWellnessStats([
          { icon: '🧘', label: 'AWR', value: 7, color: '#4A90E2' },
          { icon: '💚', label: 'RES', value: 5, color: '#2ECC71' },
          { icon: '🤝', label: 'CON', value: 8, color: '#E74C3C' },
          { icon: '⚖️', label: 'BAL', value: 7, color: '#F39C12' },
        ]);
        setDailyPrompt('Your compassion could bridge an ancient divide...');
        setError(null); // Don't show error, use fallback data
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalityProfile();
  }, [authToken]);

  // Testing Functions
  const applyTestProfile = (profileName: string) => {
    if (!originalData) {
      setOriginalData({
        trait: primaryTrait,
        scores: traitScores,
        stats: wellnessStats
      });
    }
    
    const testScores = TEST_PERSONALITY_PROFILES[profileName];
    setTraitScores(testScores);
    
    // Find new primary trait
    const primary = Object.entries(testScores).reduce((a, b) => 
      testScores[a[0]] > testScores[b[0]] ? a : b
    )[0] as keyof typeof PERSONALITY_BUILDS;
    
    setPrimaryTrait(primary);
    
    // Update wellness stats based on new personality
    const build = PERSONALITY_BUILDS[primary];
    if (build) {
      setWellnessStats([
        { icon: '🧘', label: 'AWR', value: build.baseStats.awareness, color: '#4A90E2' },
        { icon: '💚', label: 'RES', value: build.baseStats.resilience, color: '#2ECC71' },
        { icon: '🤝', label: 'CON', value: build.baseStats.connection, color: '#E74C3C' },
        { icon: '⚖️', label: 'BAL', value: build.baseStats.balance, color: '#F39C12' },
      ]);
    }
    
    // Update daily prompt
    const prompts = storyPrompts[primary] || storyPrompts.Openness;
    setDailyPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  };

  const resetToOriginal = () => {
    if (originalData) {
      setPrimaryTrait(originalData.trait);
      setTraitScores(originalData.scores);
      setWellnessStats(originalData.stats);
      setOriginalData(null);
      
      // Reset daily prompt to original trait
      const prompts = storyPrompts[originalData.trait] || storyPrompts.Openness;
      setDailyPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    }
  };

  // Secret testing mode activation (tap title 5 times)
  const handleTitleTap = () => {
    const newCount = titleTapCount + 1;
    setTitleTapCount(newCount);
    
    if (newCount >= 5) {
      setTestingMode(true);
      setTitleTapCount(0);
    }
    
    // Reset counter after 3 seconds of no taps
    setTimeout(() => setTitleTapCount(0), 3000);
  };

  if (isLoading) {
    return (
      <View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#181A20' }]}>
        <ActivityIndicator size="large" color="#4ee6e6" />
        <Text style={[styles.text, { marginTop: 16, color: '#fff' }]}>
          The Archive is attuning to your essence...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#181A20', padding: 20 }]}>
        <Text style={[styles.text, { color: '#ff6b6b', textAlign: 'center', marginBottom: 16 }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#4ee6e6', padding: 12 }]}
          onPress={() => window.location.reload()}
        >
          <Text style={[styles.text, { color: '#181A20' }]}>Reconnect to The Archive</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#181A20' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'center', paddingTop: 20, paddingBottom: 100 }}>
        
        {/* Testing/Development Mode Panel */}
        {testingMode && (
          <View style={{
            width: '95%',
            backgroundColor: '#333',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#555'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>🔧 Personality Testing Mode</Text>
              <TouchableOpacity onPress={() => setTestingMode(false)}>
                <Text style={{ color: '#ff6b6b', fontSize: 14 }}>Hide</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={{ color: '#ccc', marginBottom: 12, fontSize: 13 }}>
              Switch between personality types to see how the interface adapts:
            </Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {Object.keys(TEST_PERSONALITY_PROFILES).map(profileName => {
                const isActive = primaryTrait === Object.entries(TEST_PERSONALITY_PROFILES[profileName])
                  .reduce((a, b) => TEST_PERSONALITY_PROFILES[profileName][a[0]] > TEST_PERSONALITY_PROFILES[profileName][b[0]] ? a : b)[0];
                
                return (
                  <TouchableOpacity
                    key={profileName}
                    style={{
                      backgroundColor: isActive ? '#4ee6e6' : '#555',
                      padding: 8,
                      borderRadius: 8,
                      minWidth: 80
                    }}
                    onPress={() => applyTestProfile(profileName)}
                  >
                    <Text style={{
                      color: isActive ? '#000' : '#fff',
                      fontSize: 11,
                      textAlign: 'center',
                      fontWeight: isActive ? 'bold' : 'normal'
                    }}>
                      {profileName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#ff6b6b', padding: 10, borderRadius: 8, flex: 1 }}
                onPress={resetToOriginal}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 12, fontWeight: 'bold' }}>
                  Reset Original
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, flex: 1 }}
                onPress={() => {
                  const randomProfile = Object.keys(TEST_PERSONALITY_PROFILES)[
                    Math.floor(Math.random() * Object.keys(TEST_PERSONALITY_PROFILES).length)
                  ];
                  applyTestProfile(randomProfile);
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 12, fontWeight: 'bold' }}>
                  Random Profile
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={{ color: '#999', fontSize: 11, marginTop: 8 }}>
              Current: {currentBuild.title} ({traitScores[primaryTrait]?.toFixed(1) || '0.0'}/10)
            </Text>
          </View>
        )}
        
        {/* Show Testing Mode Hint */}
        {!testingMode && titleTapCount === 0 && (
          <TouchableOpacity 
            style={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              zIndex: 1000, 
              backgroundColor: 'rgba(0,0,0,0.3)', 
              padding: 6, 
              borderRadius: 6 
            }}
            onPress={() => setTitleTapCount(1)}
          >
            <Text style={{ color: '#ccc', fontSize: 12, opacity: 0.7 }}>🔧</Text>
          </TouchableOpacity>
        )}

        {/* Character Build Info - Now tappable for testing mode */}
        <TouchableOpacity 
          style={{ alignItems: 'center', marginBottom: 15 }}
          onPress={handleTitleTap}
          activeOpacity={0.9}
        >
          <Text style={{ color: '#4ee6e6', fontWeight: 'bold', fontSize: 16, marginBottom: 2 }}>
            {currentBuild.title} {titleTapCount > 0 && titleTapCount < 5 && '🔧'.repeat(titleTapCount)}
          </Text>
          <Text style={{ color: '#ffe066', fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>
            {currentBuild.class}
          </Text>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 22, marginBottom: 6 }}>
            Seeker of The Archive
          </Text>
          <Text style={{ color: '#ccc', fontSize: 14, textAlign: 'center', paddingHorizontal: 20 }}>
            {currentBuild.description}
          </Text>
        </TouchableOpacity>

        {/* Wellness Attributes - From GameHomeScreen */}
        <View style={{ width: '90%', marginVertical: 15 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
            Wellness Attributes
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {wellnessStats.map((stat, i) => (
              <TouchableOpacity 
                key={i} 
                style={{
                  flex: 1,
                  alignItems: 'center',
                  backgroundColor: '#23242b',
                  borderRadius: 10,
                  paddingVertical: 12,
                  marginHorizontal: 4,
                  borderWidth: 2,
                  borderColor: stat.color
                }}
                onPress={() => Alert.alert(
                  `${stat.label} - ${stat.value}`,
                  `Your ${stat.label} reflects your ${primaryTrait} nature`
                )}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 2, color: stat.color }}>
                  {stat.value}
                </Text>
                <Text style={{ color: '#ccc', fontSize: 11, fontWeight: 'bold' }}>{stat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Story Prompt - Styled like GameHomeScreen speech bubble */}
        {dailyPrompt && (
          <TouchableOpacity style={{
            backgroundColor: '#f5e6c4',
            borderRadius: 12,
            paddingHorizontal: 18,
            paddingVertical: 12,
            marginVertical: 15,
            borderWidth: 2,
            borderColor: '#e2c48d',
            maxWidth: 340,
            width: '90%'
          }}>
            <Text style={{ color: '#5a4a2c', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              Today's Tale Awaits
            </Text>
            <Text style={{ color: '#5a4a2c', fontSize: 14, fontStyle: 'italic', lineHeight: 20 }}>
              "{dailyPrompt}"
            </Text>
            <Text style={{ color: '#8B7355', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
              Tap to begin your journey →
            </Text>
          </TouchableOpacity>
        )}

        {/* Personalized Coping Arsenal - Equipment style */}
        <View style={{ width: '90%', marginVertical: 15 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
              Your Coping Arsenal
            </Text>
            <PixelButton>
              <Button 
                title="Manage Tools"
                variant="lightGreen"
                onPress={() => setIsEquipmentModalVisible(true)}
                style={{ width: 120 }}
              />
            </PixelButton>
          </View>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {currentTools.map((tool, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: '#23242b',
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#333',
                  borderLeftWidth: 4,
                  borderLeftColor: '#4ee6e6',
                  flex: 1,
                  minWidth: '45%',
                  marginBottom: 8
                }}
              >
                <Text style={{ color: '#ffe066', fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
                  {tool.name}
                </Text>
                <Text style={{ color: '#ccc', fontSize: 12, lineHeight: 16 }}>
                  {tool.description}
                </Text>
                <Text style={{ color: '#4ee6e6', fontSize: 11, marginTop: 4 }}>
                  {'⭐'.repeat(tool.effectiveness)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions - Personality specific */}
        <View style={{ width: '90%', marginVertical: 10, flexDirection: 'row', gap: 10 }}>
          <PixelButton style={{ flex: 1 }}>
            <Button 
              title="📚 Browse Stories"
              variant="darkBrown"
              onPress={() => setIsStoryCatalogVisible(true)}
              style={{ width: '100%' }}
            />
          </PixelButton>
          <PixelButton style={{ flex: 1 }}>
            <Button 
              title="🗺️ Archive Map"
              variant="lightGreen"
              onPress={() => setIsMapVisible(true)}
              style={{ width: '100%' }}
            />
          </PixelButton>
        </View>

        {/* Personality Insight Card - Dynamic based on current personality */}
        <View style={{
          width: '90%',
          backgroundColor: '#23242b',
          borderRadius: 12,
          padding: 16,
          marginVertical: 15,
          borderWidth: 1,
          borderColor: '#333',
          borderLeftWidth: 4,
          borderLeftColor: '#4ee6e6'
        }}>
          <Text style={{ color: '#4ee6e6', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
            Your Archive Resonance
          </Text>
          <Text style={{ color: '#fff', fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
            As a <Text style={{ color: '#ffe066' }}>{currentBuild.class}</Text>, you naturally gravitate toward{' '}
            {currentBuild.storyCategories.join(', ').toLowerCase()} stories. Your {primaryTrait.toLowerCase()}{' '}
            shapes how you experience and grow from each tale.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#ccc', fontSize: 12 }}>Primary Trait Score:</Text>
            <Text style={{ color: '#4ee6e6', fontSize: 12, fontWeight: 'bold' }}>
              {traitScores[primaryTrait]?.toFixed(1) || '0.0'}/10
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#ccc', fontSize: 12 }}>Preferred Tools:</Text>
            <Text style={{ color: '#ffe066', fontSize: 12 }}>
              {currentBuild.preferredTools.length} available
            </Text>
          </View>
          
          {/* Show testing mode status if active */}
          {testingMode && originalData && (
            <View style={{ 
              marginTop: 12, 
              paddingTop: 8, 
              borderTopWidth: 1, 
              borderTopColor: '#444' 
            }}>
              <Text style={{ color: '#ff6b6b', fontSize: 11, fontStyle: 'italic' }}>
                🔧 Testing Mode Active - Original: {originalData.trait}
              </Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Bottom Navigation - From GameHomeScreen */}
      <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 70,
        backgroundColor: '#23242b',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#333',
      }}>
        {[
          { icon: '📚', label: 'Codex', action: () => setIsCodexVisible(true) },
          { icon: '🗺️', label: 'Map', action: () => setIsMapVisible(true) },
          { icon: '🎒', label: 'Tools', action: () => setIsEquipmentModalVisible(true) },
          { icon: '⭐', label: 'Growth', action: () => Alert.alert('Growth Tracking', 'View your personal development journey!') }
        ].map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.action}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ fontSize: 22 }}>{item.icon}</Text>
            <Text style={{ color: '#fff', fontSize: 12 }}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modals - From GameHomeScreen */}
      <EquipmentModal
        visible={isEquipmentModalVisible}
        onClose={() => setIsEquipmentModalVisible(false)}
        onEquip={() => {}}
        onUnequip={() => {}}
        inventory={[]}
        equippedItems={{}}
      />

      <GrimoireCatalogModal
        visible={isStoryCatalogVisible}
        onClose={() => setIsStoryCatalogVisible(false)}
        onSelectGrimoire={(grimoire: Grimoire) => {
          console.log('Selected grimoire:', grimoire);
          setIsStoryCatalogVisible(false);
        }}
      />

      <CodexModal
        visible={isCodexVisible}
        onClose={() => setIsCodexVisible(false)}
        onSave={() => setIsCodexVisible(false)}
        unlockedAreas={[]}
      />

      <ArchiveMapModal
        visible={isMapVisible}
        currentRoomId=""
        onClose={() => setIsMapVisible(false)}
        onAreaSelect={() => {}}
        completedEntries={0}
        entries={[]}
      />
    </View>
  );
}
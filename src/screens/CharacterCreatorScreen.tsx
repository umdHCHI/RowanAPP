import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ImageStyle, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  baseOptions,
  clothesOptionsF,
  eyesOptionsF,
  hairOptionsF,
  mouthOptionsF,
} from '../assets/characterOptions';
import { sampleHeadBar } from '../assets/frameAssets';
import CharacterFrame from '../components/CharacterFrame';
import CharacterPreview from '../components/CharacterPreview';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../context/ThemeContext';
import { apiBaseUrl } from '../services/apiConfig';
import { appearanceService }  from '../services/appearanceService';
import { completeOnboarding } from '../services/onboardingService';
const travelBookPopup = require('../../assets/UI/character-creator-ui/UI_TravelBook_Popup01a.png');
const skinColorsSheet = require('../../assets/character-creator/sample_hud_heads/skin_colors/skin_one.png');
const sampleHeadBase = require('../../assets/character-creator/sample_hud_heads/head_base.png');

const optionLabels = [
  'Skin',
  'Hair',
  'Clothes',
  'Eyes',
  'Mouth',
];

// Background options
const bgOptions = [
  require('../../assets/character-creator/BGs/brown/brown_one.png'),
  require('../../assets/character-creator/BGs/brown/brown_two.png'),
  require('../../assets/character-creator/BGs/brown/brown_three.png'),
  require('../../assets/character-creator/BGs/brown/brown_four.png'),
];

const BASE_FRAME_WIDTH = 80;
const BASE_FRAME_HEIGHT = 45;
const BASE_COLUMNS = 6;
const BASE_ROWS = 2;
const BASE_TOTAL = 12;

function getBaseFrameStyle(index: number): ImageStyle {
  const x = (index % BASE_COLUMNS) * BASE_FRAME_WIDTH;
  const y = Math.floor(index / BASE_COLUMNS) * BASE_FRAME_HEIGHT;
  return {
    width: BASE_FRAME_WIDTH * BASE_COLUMNS, // 240
    height: BASE_FRAME_HEIGHT * BASE_ROWS,  // 180
    position: 'absolute',
    left: -x,
    top: -y,
  };
}

export default function CharacterCreatorScreen() {
  const { styles: globalStyles } = useTheme();
  const { completeCharacter, setCharacterAppearance } = useOnboarding();
  const { authToken, logout } = useAuth();
  const [skin, setSkin] = useState(0);
  const [hair, setHair] = useState(0);
  const [clothes, setClothes] = useState(0);
  const [eyes, setEyes] = useState(0);
  const [mouth, setMouth] = useState(0);
  const [background, setBackground] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cycle = (arr: any[], idx: number, dir: number) => (idx + dir + arr.length) % arr.length;

  // For easier mapping
  const optionStates = [
    { label: 'Base', idx: skin, setIdx: setSkin, arr: baseOptions },
    { label: 'Hair', idx: hair, setIdx: setHair, arr: hairOptionsF },
    { label: 'Clothes', idx: clothes, setIdx: setClothes, arr: clothesOptionsF },
    { label: 'Eyes', idx: eyes, setIdx: setEyes, arr: eyesOptionsF },
    { label: 'Mouth', idx: mouth, setIdx: setMouth, arr: mouthOptionsF },
  ];

  // Sample bar: 12 skin bases
  const skinSamples = Array.from({ length: BASE_TOTAL }, (_, i) => i);

  const handleComplete = async () => {
    setError(null);
    setIsLoading(true);

    const appearanceData = {
      gender: 'nonbinary',
      skin: String(skin),
      hair: String(hair),
      clothes: String(clothes),
      eyes: String(eyes),
      mouth: String(mouth),
      background: String(background),
    };
    
    try {
      if (authToken) {
        console.log('Current auth token:', authToken);
        console.log('Making character creation request with token:', authToken);
        console.log('Request URL:', `${apiBaseUrl}characters/`);
        console.log('Request headers:', {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        });
        
        // Create character with appearance data
        const character = await appearanceService.createAppearance;
        console.log('Character created:', character);
        
        // Update local state
        setCharacterAppearance({
          gender: 'nonbinary',
          skin,
          hair,
          clothes,
          eyes,
          mouth,
          background,
          glasses: 0,
          isComplete: true,
        });
        
        try {
          // Complete onboarding with character path
          await completeOnboarding( 'character');
          console.log('Onboarding completed successfully');
          
          // Complete character creation
          completeCharacter();
          
          // Navigate to main screen
          router.replace('/(character)');
        } catch (onboardingError) {
          console.error('Failed to complete onboarding:', onboardingError);
          // Still proceed with navigation since character was created
          completeCharacter();
          router.replace('/(character)');
        }
      }
    } catch (error: any) {
      console.error('Failed to create character/appearance:', error);
      if (error.response?.data) {
        setError(error.response.data.detail || 'Failed to create character. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#222' }}>
      <TextInput style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 12 }} placeholder='Character Name' />
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 12 }}>Create your character</Text>
      
      {/* Add logout button */}
      <TouchableOpacity
        style={[globalStyles.button, { marginBottom: 20, backgroundColor: '#ff4444' }]}
        onPress={async () => {
          await logout();
          router.replace('/(auth)/login');
        }}
      >
        <Text style={globalStyles.buttonText}>Logout and Login Again</Text>
      </TouchableOpacity>

      {/* Avatar Preview with Frame */}
      <CharacterFrame frame={bgOptions[background]} size={200}>
        <CharacterPreview
          background={bgOptions[background]}
          skinIndex={skin}
          hairSheet={hairOptionsF[0]}
          clothesSheet={clothesOptionsF[0]}
          eyesSheet={eyesOptionsF[0]}
          mouthSheet={mouthOptionsF[0]}
          hairIndex={hair}
          clothesIndex={clothes}
          eyesIndex={eyes}
          mouthIndex={mouth}
        />
      </CharacterFrame>
      {/* Sample Selection Bar for Base */}
      <View style={{ width: BASE_FRAME_WIDTH * BASE_COLUMNS + 16, height: BASE_FRAME_HEIGHT * BASE_ROWS, justifyContent: 'center', alignItems: 'center', marginBottom: 24, position: 'relative' }}>
        <Image source={travelBookPopup} style={{ position: 'absolute', width: '100%', height: '100%', resizeMode: 'stretch', zIndex: 0 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'nowrap', width: BASE_FRAME_WIDTH * BASE_COLUMNS, justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
          {Array.from({ length: BASE_COLUMNS }).map((_, colIdx) => (
            <View key={colIdx} style={{ flexDirection: 'column' }}>
              {Array.from({ length: BASE_ROWS }).map((_, rowIdx) => {
                const idx = rowIdx * BASE_COLUMNS + colIdx;
                if (idx >= BASE_TOTAL) return null;
                return (
                  <TouchableOpacity key={idx} onPress={() => setSkin(idx)} style={{ margin: 2 }}>
                    <View style={{ width: BASE_FRAME_WIDTH, height: BASE_FRAME_HEIGHT, position: 'relative', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {/* Cropped skin color sample */}
                      <Image
                        source={skinColorsSheet}
                        style={[getBaseFrameStyle(idx), { position: 'absolute', top: 0, left: 0, zIndex: 1 }]}
                      />
                      {/* Sample head frame overlay */}
                      <Image source={sampleHeadBar} style={{ width: BASE_FRAME_WIDTH, height: BASE_FRAME_HEIGHT, position: 'absolute', top: 0, left: 0, zIndex: 2 }} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {error && (
        <Text style={[globalStyles.text, { color: '#ff4444', marginTop: 10, textAlign: 'center' }]}>
          {error}
        </Text>
      )}
      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 20, opacity: isLoading ? 0.7 : 1 }]}
        onPress={handleComplete}
        disabled={isLoading}
      >
        <Text style={globalStyles.buttonText}>
          {isLoading ? 'Creating Character...' : 'Complete Character'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}


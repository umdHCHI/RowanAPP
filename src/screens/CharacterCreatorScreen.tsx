import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  clothesOptionsF,
  clothesOptionsM,
  eyesOptionsF,
  eyesOptionsM,
  glassesOptionsF,
  glassesOptionsM,
  hairOptionsF,
  hairOptionsM,
  mouthOptionsF,
  mouthOptionsM,
  skinOptionsF,
  skinOptionsM,
} from '../assets/characterOptions';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../context/ThemeContext';
import { createCharacter } from '../services/appearanceService';
import { completeOnboarding } from '../services/onboardingService';

const optionLabels = [
  'Skin',
  'Hair',
  'Clothes',
  'Glasses',
  'Eyes',
  'Mouth',
];

export default function CharacterCreatorScreen() {
  const { styles: globalStyles } = useTheme();
  const { completeCharacter, setCharacterAppearance } = useOnboarding();
  const { authToken } = useAuth();
  const [gender, setGender] = useState<'masculine' | 'feminine' | 'nonbinary'>('feminine');
  const [skin, setSkin] = useState(0);
  const [hair, setHair] = useState(0);
  const [clothes, setClothes] = useState(0);
  const [glasses, setGlasses] = useState(0);
  const [eyes, setEyes] = useState(0);
  const [mouth, setMouth] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Choose correct options based on gender
  const skinOptions = gender === 'masculine' ? skinOptionsM : skinOptionsF;
  const hairOptions = gender === 'masculine' ? hairOptionsM : hairOptionsF;
  const clothesOptions = gender === 'masculine' ? clothesOptionsM : clothesOptionsF;
  const glassesOptions = gender === 'masculine' ? glassesOptionsM : glassesOptionsF;
  const eyesOptions = gender === 'masculine' ? eyesOptionsM : eyesOptionsF;
  const mouthOptions = gender === 'masculine' ? mouthOptionsM : mouthOptionsF;

  const cycle = (arr: any[], idx: number, dir: number) => (idx + dir + arr.length) % arr.length;

  // For easier mapping
  const optionStates = [
    { label: 'Skin', idx: skin, setIdx: setSkin, arr: skinOptions },
    { label: 'Hair', idx: hair, setIdx: setHair, arr: hairOptions },
    { label: 'Clothes', idx: clothes, setIdx: setClothes, arr: clothesOptions },
    { label: 'Glasses', idx: glasses, setIdx: setGlasses, arr: glassesOptions },
    { label: 'Eyes', idx: eyes, setIdx: setEyes, arr: eyesOptions },
    { label: 'Mouth', idx: mouth, setIdx: setMouth, arr: mouthOptions },
  ];

  const handleComplete = async () => {
    setError(null);
    setIsLoading(true);

    const appearanceData = {
      gender,
      skin: String(skin),
      hair: String(hair),
      clothes: String(clothes),
      glasses: String(glasses),
      eyes: String(eyes),
      mouth: String(mouth),
    };
    
    try {
      if (authToken) {
        // Create character with appearance data
        const character = await createCharacter(authToken, appearanceData);
        console.log('Character created:', character);
        
        // Update local state
        setCharacterAppearance({
          gender,
          skin,
          hair,
          clothes,
          glasses,
          eyes,
          mouth,
        });
        
        try {
          // Complete onboarding with character path
          await completeOnboarding(authToken, 'character');
          console.log('Onboarding completed successfully');
          
          // Complete character creation
          completeCharacter();
          
          // Navigate to main screen
          router.replace('/');
        } catch (onboardingError) {
          console.error('Failed to complete onboarding:', onboardingError);
          // Still proceed with navigation since character was created
          completeCharacter();
          router.replace('/');
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
    <View style={[globalStyles.screenContainer, { alignItems: 'center', justifyContent: 'center', flex: 1 }]}> 
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity
          style={[localStyles.genderBtn, gender === 'feminine' && localStyles.genderBtnActive]}
          onPress={() => setGender('feminine')}
        >
          <Text style={localStyles.genderBtnText}>Feminine</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[localStyles.genderBtn, gender === 'masculine' && localStyles.genderBtnActive]}
          onPress={() => setGender('masculine')}
        >
          <Text style={localStyles.genderBtnText}>Masculine</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[localStyles.genderBtn, gender === 'nonbinary' && localStyles.genderBtnActive]}
          onPress={() => setGender('nonbinary')}
        >
          <Text style={localStyles.genderBtnText}>Nonbinary</Text>
        </TouchableOpacity>
      </View>
      <Text style={[globalStyles.title, { marginBottom: 12 }]}>Create your character</Text>
      <View style={globalStyles.creatorRow}>
        <View style={localStyles.characterPreview}>
          <Image source={skinOptions[skin]} style={localStyles.layer} />
          <Image source={hairOptions[hair]} style={localStyles.layer} />
          <Image source={clothesOptions[clothes]} style={localStyles.layer} />
          <Image source={glassesOptions[glasses]} style={localStyles.layer} />
          <Image source={eyesOptions[eyes]} style={localStyles.layer} />
          <Image source={mouthOptions[mouth]} style={localStyles.layer} />
        </View>
        <View style={localStyles.optionsCol}>
          {optionStates.map((opt, i) => (
            <View key={opt.label} style={localStyles.optionRow}>
              <TouchableOpacity
                style={localStyles.arrowBtn}
                onPress={() => opt.setIdx(cycle(opt.arr, opt.idx, -1))}
              >
                <Text style={localStyles.arrow}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={localStyles.label}>{opt.label}</Text>
              <TouchableOpacity
                style={localStyles.arrowBtn}
                onPress={() => opt.setIdx(cycle(opt.arr, opt.idx, 1))}
              >
                <Text style={localStyles.arrow}>{'>'}</Text>
              </TouchableOpacity>
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

const localStyles = StyleSheet.create({

  characterPreview: {
    width: 180,
    height: 320,
    marginBottom: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
  },
  layer: {
    position: 'absolute',
    width: 180,
    height: 320,
    resizeMode: 'contain',
  },
  optionsCol: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 80,
    textAlign: 'center',
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#3338',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  arrow: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  genderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2228',
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderBtnActive: {
    borderColor: '#fff',
    backgroundColor: '#444b',
  },
  genderBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
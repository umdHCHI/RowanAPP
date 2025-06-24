import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ImageStyle, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  baseOptions,
  bgOptions,
  clothesOptions,
  eyesOptions,
  hairOptions,
  mouthOptions,
} from '../../assets/characterOptions';
import { sampleHeadBar } from '../../assets/frameAssets';
import CharacterFrame from '../../components/CharacterFrame';
import CharacterPreview from '../../components/CharacterPreview';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/apiService';

const travelBookPopup = require('../../../assets/UI/character-creator-ui/UI_TravelBook_Popup01a.png');
const skinColorsSheet = require('../../../assets/character-creator/sample_hud_heads/skin_colors/skin_one.png');
const sampleHeadBase = require('../../../assets/character-creator/sample_hud_heads/head_base.png');

const BASE_FRAME_WIDTH = 60;
const BASE_FRAME_HEIGHT = 15;
const BASE_COLUMNS = 6;
const BASE_ROWS = 2;
const BASE_TOTAL = 12;

// Add skin color preview assets
const skinColorPreviews = [
  require('../../../assets/character-creator/sample_hud_heads/skin_colors/skin_one.png'),
  require('../../../assets/character-creator/sample_hud_heads/skin_colors/skin_two.png'),
  require('../../../assets/character-creator/sample_hud_heads/skin_colors/skin_three.png'),
  require('../../../assets/character-creator/sample_hud_heads/skin_colors/skin_four.png'),
  require('../../../assets/character-creator/sample_hud_heads/skin_colors/skin_five.png'),
  require('../../../assets/character-creator/sample_hud_heads/skin_colors/skin_six.png'),
  require('../../../assets/character-creator/sample_hud_heads/skin_colors/skin_seven.png'),
  require('../../../assets/character-creator/sample_hud_heads/skin_colors/skin_eight.png'),
  require('../../../assets/character-creator/sample_hud_heads/skin_colors/skin_nine.png'),
  require('../../../assets/character-creator/sample_hud_heads/skin_colors/skin_ten.png'),
  require('../../../assets/character-creator/sample_hud_heads/skin_colors/skin_eleven.png'),
  require('../../../assets/character-creator/sample_hud_heads/skin_colors/skin_twelve.png'),
];

function getBaseFrameStyle(index: number): ImageStyle {
  const x = (index % BASE_COLUMNS) * BASE_FRAME_WIDTH;
  const y = Math.floor(index / BASE_COLUMNS) * BASE_FRAME_HEIGHT;
  return {
    width: BASE_FRAME_WIDTH * BASE_COLUMNS,
    height: BASE_FRAME_HEIGHT * BASE_ROWS,
    position: 'absolute',
    left: -x,
    top: -y,
  };
}

export default function CharacterCreatorScreen() {
  const { styles: globalStyles } = useTheme();
  const { completeCharacter, setCharacterAppearance } = useOnboarding();
  const { authToken, logout } = useAuth();
  
  // Character states - matching backend Character model fields
  const [characterName, setCharacterName] = useState('');
  const [selectedBaseModel, setSelectedBaseModel] = useState(0);
  const [selectedSkinColor, setSelectedSkinColor] = useState(0);
  const [selectedHairStyle, setSelectedHairStyle] = useState(0);
  const [selectedHairColor, setSelectedHairColor] = useState(0);
  const [selectedEyeType, setSelectedEyeType] = useState(0);
  const [selectedEyeColor, setSelectedEyeColor] = useState(0);
  const [selectedMouthType, setSelectedMouthType] = useState(0);
  const [selectedShirtType, setSelectedShirtType] = useState(0);
  const [selectedBackgroundType, setSelectedBackgroundType] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(0);

  const cycle = (arr: any[], idx: number, dir: number) => (idx + dir + arr.length) % arr.length;

  // Helper function to get the correct hair index based on style and color
  const getHairIndex = () => {
    // Hair array is organized as: 32 styles × 16 colors = 512 total
    // Each hair style has 32 variations (different colors)
    return selectedHairStyle + (selectedHairColor * 32);
  };

  // Helper function to get clothes index based on style and color
  const getClothesIndex = () => {
    // Clothes array is organized as: 12 styles × 16 colors = 192 total
    return selectedShirtType + (selectedSkinColor * 12); // Using skin color for clothes color variation
  };

  // Helper function to get eyes index
  const getEyesIndex = () => {
    // Eyes array is organized as: 12 styles × 16 colors = 192 total
    return selectedEyeType + (selectedEyeColor * 12);
  };

  // Category definitions with proper limits based on backend model
  const categories = [
    { label: 'Base', options: Math.min(baseOptions.length, 12), current: selectedBaseModel, setter: setSelectedBaseModel },
    { label: 'Skin', options: 16, current: selectedSkinColor, setter: setSelectedSkinColor },
    { label: 'Hair Style', options: 32, current: selectedHairStyle, setter: setSelectedHairStyle },
    { label: 'Hair Color', options: 16, current: selectedHairColor, setter: setSelectedHairColor },
    { label: 'Eyes', options: 12, current: selectedEyeType, setter: setSelectedEyeType },
    { label: 'Eye Color', options: 16, current: selectedEyeColor, setter: setSelectedEyeColor },
    { label: 'Mouth', options: Math.min(mouthOptions.length, 12), current: selectedMouthType, setter: setSelectedMouthType },
    { label: 'Clothes', options: 12, current: selectedShirtType, setter: setSelectedShirtType },
    { label: 'Background', options: Math.min(bgOptions.length, 12), current: selectedBackgroundType, setter: setSelectedBackgroundType },
  ];

  const handleCharacterCreation = async () => {
    if (!characterName.trim()) {
      setError('Please enter a character name');
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      if (authToken) {
        console.log('Starting character creation process...');
        console.log('Character name:', characterName);
        console.log('Current selections:', {
          selectedBaseModel,
          selectedSkinColor,
          selectedHairStyle,
          selectedHairColor,
          selectedEyeType,
          selectedEyeColor,
          selectedMouthType,
          selectedShirtType,
          selectedBackgroundType
        });
        
        // Step 1: Create the character
        const characterCreateData = {
          name: characterName.trim()
        };
        
        console.log('Creating character with data:', characterCreateData);
        const character = await apiService.post('characters', characterCreateData);
        
        console.log('Character created successfully:', character);
        
        // Step 2: Update character customization using exact backend field names
        const customizationData = {
          selected_base_model: selectedBaseModel,
          selected_skin_color: selectedSkinColor,
          selected_hair_style: selectedHairStyle,
          selected_hair_color: selectedHairColor,
          selected_eye_type: selectedEyeType,
          selected_eye_color: selectedEyeColor,
          selected_mouth_type: selectedMouthType,
          selected_shirt_type: selectedShirtType,
          selected_background_type: selectedBackgroundType,
        };
        
        console.log('Updating character customization with data:', customizationData);
        
        try {
          const updatedCharacter = await apiService.patch('characters', customizationData, {
            urlSuffix: `${(character as {id: string}).id}/update_customization/`
          });
          
          console.log('Character customization updated successfully:', updatedCharacter);
        } catch (customizationError) {
          console.warn('Customization update failed, but character was created:', customizationError);
          // Continue with the process even if customization fails
        }
        
        // Update local onboarding state with computed indices for frontend rendering
        setCharacterAppearance({
          gender: 'nonbinary',
          skin: selectedBaseModel, // Use base model as skin index for preview
          hair: getHairIndex(),
          clothes: getClothesIndex(),
          eyes: getEyesIndex(),
          mouth: selectedMouthType,
          background: selectedBackgroundType,
          glasses: 0,
          isComplete: true,
        });
        
        try {
          // Complete onboarding with character path
          console.log('Completing onboarding...');
          await apiService.completeOnboarding('character');
          console.log('Onboarding completed successfully');
        } catch (onboardingError) {
          console.error('Failed to complete onboarding:', onboardingError);
          // Don't fail the entire process if onboarding completion fails
        }
        
        // Mark character creation as complete
        completeCharacter();
        
        // Navigate to main screen
        console.log('Navigating to character screen...');
        router.replace('/(character)/character');
        
      } else {
        setError('Authentication required. Please log in again.');
      }
    } catch (error: any) {
      console.error('Character creation failed:', error);
      
      // Handle different types of errors
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          // Handle field-specific validation errors
          const errorMessages = [];
          
          // Extract error messages from nested object
          for (const [field, messages] of Object.entries(error.response.data)) {
            if (Array.isArray(messages)) {
              errorMessages.push(...messages);
            } else if (typeof messages === 'string') {
              errorMessages.push(messages);
            }
          }
          
          setError(errorMessages.length > 0 
            ? errorMessages.join('. ') 
            : 'Failed to create character. Please check your input.'
          );
        } else if (typeof error.response.data === 'string') {
          setError(error.response.data);
        } else {
          setError('Failed to create character. Please try again.');
        }
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryButtons = () => {
    return (
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === index && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(index)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === index && styles.selectedCategoryText
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCustomizationControls = () => {
    const currentCategory = categories[selectedCategory];
    
    if (selectedCategory === 0) {
      // Special skin selection UI (your original design)
      return (
        <View style={styles.skinSelectorContainer}>
          <Image source={travelBookPopup} style={styles.skinSelectorBackground} />
          <View style={styles.skinGrid}>
            {Array.from({ length: BASE_COLUMNS }).map((_, colIdx) => (
              <View key={colIdx} style={styles.skinColumn}>
                {Array.from({ length: BASE_ROWS }).map((_, rowIdx) => {
                  const idx = rowIdx * BASE_COLUMNS + colIdx;
                  if (idx >= skinColorPreviews.length) return null;
                  return (
                    <TouchableOpacity 
                      key={idx} 
                      onPress={() => {
                        setSelectedSkinColor(idx);
                        setSelectedBaseModel(idx);
                      }}
                      style={[
                        styles.skinOption,
                        selectedSkinColor === idx && styles.selectedSkinOption
                      ]}
                    >
                      <View style={styles.skinFrame}>
                        <Image
                          source={skinColorPreviews[idx]}
                          style={styles.skinColorImage}
                        />
                        <Image source={sampleHeadBar} style={styles.skinFrameOverlay} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      );
    } else {
      // Generic option selector for other categories
      return (
        <View style={styles.optionSelectorContainer}>
          <View style={styles.optionControls}>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => currentCategory.setter(
                cycle(Array(currentCategory.options).fill(0), currentCategory.current, -1)
              )}
            >
              <Text style={styles.arrowText}>←</Text>
            </TouchableOpacity>
            
            <Text style={styles.optionText}>
              {currentCategory.current + 1} / {currentCategory.options}
            </Text>
            
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => currentCategory.setter(
                cycle(Array(currentCategory.options).fill(0), currentCategory.current, 1)
              )}
            >
              <Text style={styles.arrowText}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TextInput 
        style={styles.nameInput} 
        placeholder='Character Name'
        placeholderTextColor='#999'
        value={characterName}
        onChangeText={setCharacterName}
      />
      
      <Text style={styles.title}>Create your character</Text>
      
      {/* Add logout button */}
      <TouchableOpacity
        style={[globalStyles.button, styles.logoutButton]}
        onPress={async () => {
          await logout();
          router.replace('/(auth)/login');
        }}
      >
        <Text style={globalStyles.buttonText}>Logout and Login Again</Text>
      </TouchableOpacity>

      {/* Avatar Preview with Frame */}
      <CharacterFrame frame={bgOptions[selectedBackgroundType]} size={200}>
        <CharacterPreview
          background={bgOptions[selectedBackgroundType]}
          skinIndex={baseOptions[selectedBaseModel]}
          hairSheet={hairOptions[getHairIndex()]}
          clothesSheet={clothesOptions[getClothesIndex()]}
          eyesSheet={eyesOptions[getEyesIndex()]}
          mouthSheet={mouthOptions[selectedMouthType]}
          hairIndex={getHairIndex()}
          clothesIndex={getClothesIndex()}
          eyesIndex={getEyesIndex()}
          mouthIndex={selectedMouthType}
        />
      </CharacterFrame>

      {/* Category Selection */}
      {renderCategoryButtons()}

      {/* Customization Controls */}
      {renderCustomizationControls()}

      {error && (
        <Text style={[globalStyles.text, styles.errorText]}>
          {error}
        </Text>
      )}
      
      <TouchableOpacity
        style={[globalStyles.button, styles.completeButton, { opacity: isLoading ? 0.7 : 1 }]}
        onPress={handleCharacterCreation}
        disabled={isLoading}
      >
        <Text style={globalStyles.buttonText}>
          {isLoading ? 'Creating Character...' : 'Complete Character'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  nameInput: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#555',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 200,
    textAlign: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  logoutButton: {
    marginBottom: 20,
    backgroundColor: '#ff4444',
  },
  categoryContainer: {
    marginVertical: 20,
    maxHeight: 50,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#444',
    borderRadius: 20,
  },
  selectedCategoryButton: {
    backgroundColor: '#6B46C1',
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  skinSelectorContainer: {
    width: BASE_FRAME_WIDTH * BASE_COLUMNS + 16,
    height: BASE_FRAME_HEIGHT * BASE_ROWS + 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  skinSelectorBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
    zIndex: 0,
  },
  skinGrid: {
    flexDirection: 'row',
    width: BASE_FRAME_WIDTH * BASE_COLUMNS,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  skinColumn: {
    flexDirection: 'column',
  },
  skinOption: {
    margin: 2,
  },
  selectedSkinOption: {
    borderWidth: 2,
    borderColor: '#6B46C1',
    borderRadius: 4,
  },
  skinFrame: {
    width: BASE_FRAME_WIDTH,
    height: BASE_FRAME_HEIGHT,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  skinColorImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  skinFrameOverlay: {
    width: BASE_FRAME_WIDTH,
    height: BASE_FRAME_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
  },
  optionSelectorContainer: {
    marginVertical: 20,
  },
  optionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 200,
  },
  arrowButton: {
    backgroundColor: '#6B46C1',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    minWidth: 80,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff4444',
    marginTop: 10,
    textAlign: 'center',
  },
  completeButton: {
    marginTop: 20,
  },
});
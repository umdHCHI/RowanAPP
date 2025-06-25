import React, { useState } from 'react';
import { Image, ImageStyle, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  baseOptions,
  bgOptions,
  clothesOptions,
  eyebrowsOptions,
  eyesOptions,
  hairOptions,
  mouthOptions
} from '../../assets/characterOptions';
import { sampleHeadBar } from '../../assets/frameAssets';
import CharacterFrame from '../../components/CharacterFrame';
import CharacterPreview from '../../components/CharacterPreview';
import { useMasterState } from '../../context/MasterStateContext';

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
  // Use the master state context instead of individual contexts
  const { 
    theme, 
    character, 
    loading, 
    onboarding,
    auth
  } = useMasterState();
  
  const [selectedCategory, setSelectedCategory] = useState(0);

  const cycle = (arr: any[], idx: number, dir: number) => (idx + dir + arr.length) % arr.length;

  // Category definitions with proper limits based on backend model
  const categories = [
    { label: 'Base', options: Math.min(baseOptions.length, 12), current: character.selectedBaseModel, setter: character.setSelectedBaseModel },
    { label: 'Skin', options: 16, current: character.selectedSkinColor, setter: character.setSelectedSkinColor },
    { label: 'Hair Style', options: 12, current: character.selectedHairStyle, setter: character.setSelectedHairStyle },
    { label: 'Hair Color', options: 16, current: character.selectedHairColor, setter: character.setSelectedHairColor },
    { label: 'Eyes', options: 12, current: character.selectedEyeType, setter: character.setSelectedEyeType },
    { label: 'Eye Color', options: 16, current: character.selectedEyeColor, setter: character.setSelectedEyeColor },
    { label: 'Eyebrow Style', options: 12, current: character.selectedEyebrowStyle, setter: character.setSelectedEyebrowStyle },
    { label: 'Eyebrow Color', options: 16, current: character.selectedEyebrowColor, setter: character.setSelectedEyebrowColor },
    { label: 'Mouth', options: Math.min(mouthOptions.length, 12), current: character.selectedMouthType, setter: character.setSelectedMouthType },
    { label: 'Clothes', options: 12, current: character.selectedShirtType, setter: character.setSelectedShirtType },
    { label: 'Background', options: Math.min(bgOptions.length, 12), current: character.selectedBackgroundType, setter: character.setSelectedBackgroundType },
  ];

  const handleCharacterCreation = async () => {
    // Use the centralized character creation function
    await character.createCharacter();
  };

  const handleLogout = async () => {
    // Use the centralized logout function
    await auth.logout();
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
                        character.setSelectedSkinColor(idx);
                        character.setSelectedBaseModel(idx);
                      }}
                      style={[
                        styles.skinOption,
                        character.selectedSkinColor === idx && styles.selectedSkinOption
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
        value={character.characterName}
        onChangeText={character.setCharacterName}
      />
      
      <Text style={styles.title}>Create your character</Text>
      
      {/* Add logout button */}
      <TouchableOpacity
        style={[theme.styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={theme.styles.buttonText}>Logout and Login Again</Text>
      </TouchableOpacity>

      {/* Avatar Preview with Frame */}
      <CharacterFrame frame={bgOptions[character.selectedBackgroundType]} size={200}>
        <CharacterPreview
          background={bgOptions[character.selectedBackgroundType]}
          skinIndex={baseOptions[character.selectedBaseModel]}
          hairSheet={hairOptions[character.getHairIndex()]}
          clothesSheet={clothesOptions[character.getClothesIndex()]}
          eyesSheet={eyesOptions[character.getEyesIndex()]}
          eyebrowsSheet={eyebrowsOptions[character.getEyebrowsIndex()]}
          mouthSheet={mouthOptions[character.selectedMouthType]}
          hairIndex={character.getHairIndex()}
          clothesIndex={character.getClothesIndex()}
          eyesIndex={character.getEyesIndex()}
          eyebrowsIndex={character.getEyebrowsIndex()}
          mouthIndex={character.selectedMouthType}
        />
      </CharacterFrame>

      {/* Category Selection */}
      {renderCategoryButtons()}

      {/* Customization Controls */}
      {renderCustomizationControls()}

      <TouchableOpacity
        style={[theme.styles.button, styles.completeButton, { opacity: loading.isLoading ? 0.7 : 1 }]}
        onPress={handleCharacterCreation}
        disabled={loading.isLoading}
      >
        <Text style={theme.styles.buttonText}>
          {loading.isLoading ? 'Creating Character...' : 'Complete Character'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

//needs to be changed as this is getting in the way of some of the styles for the character creator
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
  completeButton: {
    marginTop: 20,
  },
});
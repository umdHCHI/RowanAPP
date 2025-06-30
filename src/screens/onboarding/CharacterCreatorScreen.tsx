//should be cleaned up and centralized now 
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  CHARACTER_CREATOR_CONSTANTS,
  CategorySelector,
  CharacterNameInput,
  CharacterPreviewSection,
  ColorOptionControls,
  StyleControls,
  createCharacterCreatorCategories,
  useCharacterCreation,
  useMasterState
} from '../../imports';

export default function CharacterCreatorScreen() {
  const { theme, character, loading, onboarding, auth } = useMasterState();
  const [selectedCategory, setSelectedCategory] = useState(0);

  // Create centralized category configurations with memoization
  const { styleCategories, colorCategories } = useMemo(() => 
    createCharacterCreatorCategories(
      {
        selectedHairStyle: character.selectedHairStyle,
        selectedEyeType: character.selectedEyeType,
        selectedEyebrowStyle: character.selectedEyebrowStyle,
        selectedMouthType: character.selectedMouthType,
        selectedShirtType: character.selectedShirtType,
        selectedBackgroundType: character.selectedBackgroundType,
        selectedBaseModel: character.selectedBaseModel,
        selectedHairColor: character.selectedHairColor,
        selectedEyeColor: character.selectedEyeColor,
        selectedEyebrowColor: character.selectedEyebrowColor,
        selectedClothesColor: character.selectedClothesColor,
        selectedBackgroundColor: character.selectedBackgroundColor,
      },
      {
        setSelectedHairStyle: character.setSelectedHairStyle,
        setSelectedEyeType: character.setSelectedEyeType,
        setSelectedEyebrowStyle: character.setSelectedEyebrowStyle,
        setSelectedMouthType: character.setSelectedMouthType,
        setSelectedShirtType: character.setSelectedShirtType,
        setSelectedBackgroundType: character.setSelectedBackgroundType,
        setSelectedBaseModel: character.setSelectedBaseModel,
        setSelectedHairColor: character.setSelectedHairColor,
        setSelectedEyeColor: character.setSelectedEyeColor,
        setSelectedEyebrowColor: character.setSelectedEyebrowColor,
        setSelectedClothesColor: character.setSelectedClothesColor,
        setSelectedBackgroundColor: character.setSelectedBackgroundColor,
      }
    ), [character]
  );

  // Custom hook for character creation logic
  const { handleCharacterCreation } = useCharacterCreation({
    characterName: character.characterName,
    createCharacter: character.createCharacter,
    completeCharacter: onboarding.completeCharacter,
  });

  // Memoized handlers
  const handleLogout = useCallback(async () => {
    await auth.logout();
  }, [auth]);

  const handleNameChange = useCallback((name: string) => {
    character.setCharacterName(name);
  }, [character]);

  const handleCategorySelect = useCallback((index: number) => {
    setSelectedCategory(index);
  }, []);

  // Memoized current category
  const currentStyleCategory = useMemo(() => 
    styleCategories[selectedCategory], 
    [styleCategories, selectedCategory]
  );

  return (
    <View style={theme.styles.characterCreatorContainer}>
      {/* Header Section */}
      <CharacterNameInput
        characterName={character.characterName}
        onNameChange={handleNameChange}
        onLogout={handleLogout}
        styles={theme.styles}
      />

      {/* Main Content Area */}
      <View style={theme.styles.characterCreatorMainContent}>
        {/* Left Side - Character Preview */}
        <CharacterPreviewSection
          character={character}
          styles={theme.styles}
        />

        {/* Right Side - Color Options */}
        <View style={theme.styles.characterCreatorColorSection}>
          <CategorySelector
            title={CHARACTER_CREATOR_CONSTANTS.SECTIONS.COLOR_OPTIONS}
            categories={colorCategories}
            selectedIndex={-1} // No selection for color categories
            onCategorySelect={() => {}} // No-op for color categories
            styles={theme.styles}
            maxHeight={CHARACTER_CREATOR_CONSTANTS.COLOR_OPTIONS_MAX_HEIGHT}
          />
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: CHARACTER_CREATOR_CONSTANTS.COLOR_OPTIONS_MAX_HEIGHT }}>
            {colorCategories.map((category, index) => (
              <ColorOptionControls
                key={index}
                category={category}
                styles={theme.styles}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Bottom Section - Style Options */}
      <View style={theme.styles.characterCreatorBottomSection}>
        <CategorySelector
          title={CHARACTER_CREATOR_CONSTANTS.SECTIONS.STYLE_OPTIONS}
          categories={styleCategories}
          selectedIndex={selectedCategory}
          onCategorySelect={handleCategorySelect}
          styles={theme.styles}
          horizontal={true}
        />
        {currentStyleCategory && (
          <StyleControls
            category={currentStyleCategory}
            styles={theme.styles}
          />
        )}
      </View>

      {/* Complete Button */}
      <View style={theme.styles.characterCreatorButtonSection}>
        <TouchableOpacity
          style={[
            theme.styles.characterCreatorCompleteButton, 
            { opacity: loading.isLoading ? 0.7 : 1 }
          ]}
          onPress={handleCharacterCreation}
          disabled={loading.isLoading}
        >
          <Text style={theme.styles.characterCreatorCompleteButtonText}>
            {loading.isLoading 
              ? CHARACTER_CREATOR_CONSTANTS.BUTTONS.CREATING_CHARACTER 
              : CHARACTER_CREATOR_CONSTANTS.BUTTONS.COMPLETE_CHARACTER
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
import { createCharacterCreatorStyles } from "@/src/styles/screens/characterCreator";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  CHARACTER_CREATOR_CONSTANTS,
  CharacterNameInput,
  CharacterPreviewSection,
  ColorOptionControls,
  StyleControls,
  useCharacterCreation,
  useMasterState,
} from "../../imports";

import { AssetLabel } from "../../context/modules/index";

const { width, height } = Dimensions.get("window");

export default function ArchiveCharacterCreatorScreen() {
  const { theme, character, loading, onboarding, auth } = useMasterState();
  const creatorStyles = createCharacterCreatorStyles(
    theme.characterCreatorTheme
  );
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  const { styleCategories, colorCategories } = character;

  // Load existing character data on mount
  useEffect(() => {
    const loadExistingCharacter = async () => {
      if (!character.backendCharacter) {
        await character.loadCharacter(true);
      }
    };

    loadExistingCharacter();
  }, []); // Only run on mount

  const { handleCharacterCreation, isCreating } = useCharacterCreation({
    characterName: character.characterName,
    createCharacter: character.createCharacter,
    characterId: character.backendCharacter?.id,
    customizationData: character.updateCharacter,
    updateCharacterCustomization: character.updateCharacter,
    completeCharacter: onboarding.completeCharacter,
  });

  const handleNameChange = useCallback(
    (name: string): void => {
      character.setCharacterName(name);
    },
    [character]
  );

  const handleCategorySelect = useCallback((index: number): void => {
    setSelectedCategory(index);
  }, []);

  const currentStyleCategory = useMemo(
    () => styleCategories[selectedCategory],
    [styleCategories, selectedCategory]
  );

  const getCurrentColorCategory = useMemo(() => {
    if (selectedCategory === 0) {
      return colorCategories[0];
    }

    const styleToColorIndexMap: { [key: number]: number } = {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      4: -1,
      5: 4,
      6: 5,
    };

    const colorIndex = styleToColorIndexMap[selectedCategory];
    return colorIndex !== -1 && colorIndex !== undefined
      ? colorCategories[colorIndex]
      : null;
  }, [selectedCategory, colorCategories]);

  return (
    <View style={creatorStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={creatorStyles.backgroundColor}
      />

      <View style={creatorStyles.backgroundContainer}>
        <View style={creatorStyles.floatingElements}></View>
        <View style={creatorStyles.gradientOverlay} />
      </View>

      <ScrollView
        style={creatorStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={creatorStyles.header}>
          <Text style={creatorStyles.forgeTitle}>THE ARCHIVE</Text>
          <Text style={creatorStyles.forgeSubtitle}>Soul Forge Workshop</Text>
          <View style={creatorStyles.decorativeLine} />
        </View>

        <View style={creatorStyles.nameSection}>
          <AssetLabel
            assetType="sectionIcons"
            assetName="name"
            text="Scholar's Name"
            style={{ justifyContent: "center", alignSelf: "center" }}
            iconStyle={{ width: 32, height: 32, marginRight: 8 }}
            textStyle={creatorStyles.nameLabel}
          />
          <CharacterNameInput
            characterName={character.characterName}
            onNameChange={handleNameChange}
            styles={creatorStyles}
          />
        </View>

        <View style={creatorStyles.previewSection}>
          <AssetLabel
            assetType="sectionIcons"
            assetName="preview"
            text="Avatar Preview"
            style={{ justifyContent: "center", alignSelf: "center" }}
            iconStyle={{ width: 32, height: 32, marginRight: 8 }}
            textStyle={creatorStyles.sectionTitle}
          />
          <View style={creatorStyles.previewContainer}>
            <CharacterPreviewSection
              character={character}
              styles={creatorStyles}
            />
          </View>
        </View>

        <View style={creatorStyles.styleSection}>
          <AssetLabel
            assetType="sectionIcons"
            assetName="appearance"
            text="Appearance Options"
            style={{ justifyContent: "center", alignSelf: "center" }}
            iconStyle={{ width: 32, height: 32, marginRight: 8 }}
            textStyle={creatorStyles.sectionTitle}
          />

          <View style={creatorStyles.categoryGrid}>
            <View style={creatorStyles.categoryRow}>
              {styleCategories.slice(0, 4).map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    creatorStyles.categoryButton,
                    selectedCategory === index &&
                      creatorStyles.selectedCategoryButton,
                  ]}
                  onPress={() => handleCategorySelect(index)}
                >
                  <Text
                    style={[
                      creatorStyles.categoryText,
                      selectedCategory === index &&
                        creatorStyles.selectedCategoryText,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={creatorStyles.categoryRow}>
              {styleCategories.slice(4).map((category, index) => (
                <TouchableOpacity
                  key={index + 4}
                  style={[
                    creatorStyles.categoryButton,
                    selectedCategory === index + 4 &&
                      creatorStyles.selectedCategoryButton,
                  ]}
                  onPress={() => handleCategorySelect(index + 4)}
                >
                  <Text
                    style={[
                      creatorStyles.categoryText,
                      selectedCategory === index + 4 &&
                        creatorStyles.selectedCategoryText,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {currentStyleCategory && (
            <View>
              <StyleControls
                category={currentStyleCategory}
                styles={creatorStyles}
              />
            </View>
          )}
        </View>

        {getCurrentColorCategory && (
          <View style={creatorStyles.colorSection}>
            <AssetLabel
              assetType="sectionIcons"
              assetName="appearance"
              style={{ justifyContent: "center", alignSelf: "center" }}
              iconStyle={{ width: 32, height: 32, marginRight: 8 }}
              text={`Color for ${currentStyleCategory?.label}`}
              textStyle={creatorStyles.sectionTitle}
            />
            <View>
              <ColorOptionControls
                category={getCurrentColorCategory}
                styles={creatorStyles}
              />
            </View>
          </View>
        )}

        <View style={creatorStyles.completeSection}>
          <TouchableOpacity
            style={[
              creatorStyles.completeButton,
              { opacity: loading.isLoading || isCreating ? 0.7 : 1 },
            ]}
            onPress={
              loading.isLoading || isCreating
                ? undefined
                : handleCharacterCreation
            }
            disabled={loading.isLoading || isCreating}
            activeOpacity={loading.isLoading || isCreating ? 1 : 0.8}
          >
            <Text style={creatorStyles.completeButtonText}>
              {loading.isLoading || isCreating
                ? CHARACTER_CREATOR_CONSTANTS.BUTTONS.CREATING_CHARACTER
                : CHARACTER_CREATOR_CONSTANTS.BUTTONS.COMPLETE_CHARACTER}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

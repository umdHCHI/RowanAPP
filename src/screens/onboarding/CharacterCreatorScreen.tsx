import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  CHARACTER_CREATOR_CONSTANTS,
  CharacterNameInput,
  CharacterPreviewSection,
  ColorOptionControls,
  StyleControls,
  createCharacterCreatorCategories,
  useCharacterCreation,
  useMasterState
} from "../../imports";

const { width, height } = Dimensions.get('window');

// TypeScript interfaces
interface FloatingElementProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  translateY?: number;
}

// Floating mystical elements
const FloatingElement: React.FC<FloatingElementProps> = ({ 
  children, 
  duration = 4000, 
  delay = 0, 
  translateY = 25
}) => {
  const floatAnim = new Animated.Value(0);

  useEffect(() => {
    const animate = (): void => {
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, [duration, delay, translateY]);

  const translateYInterpolated = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -translateY],
  });

  return (
    <Animated.View style={{ transform: [{ translateY: translateYInterpolated }] }}>
      {children}
    </Animated.View>
  );
};

export default function ArchiveCharacterCreatorScreen() {
  const { theme, character, loading, onboarding, auth } = useMasterState();
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  // Create centralized category configurations with memoization - KEEP YOUR BACKEND INTEGRATION
  const { styleCategories, colorCategories } = useMemo(
    () =>
      createCharacterCreatorCategories(
        {
          selectedHairStyle: character.selectedHairStyle,
          selectedEyeType: character.selectedEyeType,
          selectedEyebrowStyle: character.selectedEyebrowStyle,
          selectedMouthType: character.selectedMouthType,
          selectedShirtType: character.selectedShirtType,
          selectedBackgroundType: character.selectedBackgroundType,
          selectedBaseModel: character.selectedBaseModel,
          selectedBaseColor: character.selectedBaseColor,
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
          setSelectedBaseColor: character.setSelectedBaseColor,
          setSelectedHairColor: character.setSelectedHairColor,
          setSelectedEyeColor: character.setSelectedEyeColor,
          setSelectedEyebrowColor: character.setSelectedEyebrowColor,
          setSelectedClothesColor: character.setSelectedClothesColor,
          setSelectedBackgroundColor: character.setSelectedBackgroundColor,
        }
      ),
    [
      character.selectedHairStyle,
      character.selectedEyeType,
      character.selectedEyebrowStyle,
      character.selectedMouthType,
      character.selectedShirtType,
      character.selectedBackgroundType,
      character.selectedBaseModel,
      character.selectedBaseColor,
      character.selectedHairColor,
      character.selectedEyeColor,
      character.selectedEyebrowColor,
      character.selectedClothesColor,
      character.selectedBackgroundColor,
      character.setSelectedHairStyle,
      character.setSelectedEyeType,
      character.setSelectedEyebrowStyle,
      character.setSelectedMouthType,
      character.setSelectedShirtType,
      character.setSelectedBackgroundType,
      character.setSelectedBaseModel,
      character.setSelectedBaseColor,
      character.setSelectedHairColor,
      character.setSelectedEyeColor,
      character.setSelectedEyebrowColor,
      character.setSelectedClothesColor,
      character.setSelectedBackgroundColor,
    ]
  );

  // Custom hook for character creation logic - KEEP YOUR BACKEND INTEGRATION
  const { handleCharacterCreation } = useCharacterCreation({
    characterName: character.characterName,
    createCharacter: character.createCharacter,
    characterId: character.backendCharacter?.id,
    customizationData: character.updateCharacter, 
    updateCharacterCustomization: character.updateCharacter, 
    completeCharacter: onboarding.completeCharacter,
  });

  // Memoized handlers - KEEP YOUR BACKEND INTEGRATION
  const handleNameChange = useCallback(
    (name: string): void => {
      character.setCharacterName(name);
    },
    [character]
  );

  const handleCategorySelect = useCallback((index: number): void => {
    setSelectedCategory(index);
  }, []);

  // Memoized current category - KEEP YOUR BACKEND INTEGRATION
  const currentStyleCategory = useMemo(
    () => styleCategories[selectedCategory],
    [styleCategories, selectedCategory]
  );

  // Get the color category that corresponds to the selected style category
  const getCurrentColorCategory = useMemo(() => {
    // Always show Skin Color color picker when Base Model is selected
    if (selectedCategory === 0) {
      return colorCategories[0]; // Skin Color
    }
    // Otherwise, use the normal mapping
    const styleToColorIndexMap: { [key: number]: number } = {
      0: 0, // Base Model → Skin Color
      1: 1, // Hair Style → Hair Color
      2: 2, // Eyes → Eye Color
      3: 3, // Eyebrow Style → Eyebrow Color
      4: -1, // Mouth → No color equivalent
      5: 4, // Clothes → Clothes Color
      6: 5, // Background → Background Color
    };
    const colorIndex = styleToColorIndexMap[selectedCategory];
    return colorIndex !== -1 && colorIndex !== undefined ? colorCategories[colorIndex] : null;
  }, [selectedCategory, colorCategories]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0b0f" />
      
      {/* Mystical Background */}
      <View style={styles.backgroundContainer}>
        <View style={styles.floatingElements}>
          <FloatingElement delay={0} duration={5000} translateY={20}>
            <Text style={[styles.floatingIcon, { left: '5%', top: '10%' }]}>⚒️</Text>
          </FloatingElement>
          <FloatingElement delay={1500} duration={4000} translateY={15}>
            <Text style={[styles.floatingIcon, { right: '10%', top: '15%' }]}>✨</Text>
          </FloatingElement>
          <FloatingElement delay={3000} duration={6000} translateY={25}>
            <Text style={[styles.floatingIcon, { left: '15%', top: '70%' }]}>🔮</Text>
          </FloatingElement>
        </View>
        <View style={styles.gradientOverlay} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.forgeTitle}>THE ARCHIVE</Text>
          <Text style={styles.forgeSubtitle}>Soul Forge Workshop</Text>
          <View style={styles.decorativeLine} />
        </View>

        {/* Character Name Input - Made Prominent */}
        <View style={styles.nameSection}>
          <Text style={styles.nameLabel}>🏷️ Scholar's Name</Text>
          <CharacterNameInput
            characterName={character.characterName}
            onNameChange={handleNameChange}
            styles={theme.styles}
          />
        </View>

        {/* Character Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>✨ Avatar Preview</Text>
          <View style={styles.previewContainer}>
            <CharacterPreviewSection character={character} styles={theme.styles} />
          </View>
        </View>

        {/* Style Options - Two Rows for Mobile */}
        <View style={styles.styleSection}>
          <Text style={styles.sectionTitle}>🎨 Appearance Options</Text>
          
          {/* Custom Two-Row Grid Layout */}
          <View style={styles.categoryGrid}>
            {/* First Row */}
            <View style={styles.categoryRow}>
              {styleCategories.slice(0, 4).map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryButton,
                    selectedCategory === index && styles.selectedCategoryButton
                  ]}
                  onPress={() => handleCategorySelect(index)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === index && styles.selectedCategoryText
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Second Row */}
            <View style={styles.categoryRow}>
              {styleCategories.slice(4).map((category, index) => (
                <TouchableOpacity
                  key={index + 4}
                  style={[
                    styles.categoryButton,
                    selectedCategory === (index + 4) && styles.selectedCategoryButton
                  ]}
                  onPress={() => handleCategorySelect(index + 4)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === (index + 4) && styles.selectedCategoryText
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Style Options Display */}
          {currentStyleCategory && (
            <View>
              <StyleControls
                category={currentStyleCategory}
                styles={theme.styles}
              />
            </View>
          )}
        </View>

        {/* Single Color Picker - Only for Selected Style */}
        {getCurrentColorCategory && (
          <View style={styles.colorSection}>
            <Text style={styles.sectionTitle}>
              🎨 Color for {currentStyleCategory?.label}
            </Text>
            <View>
              <ColorOptionControls
                category={getCurrentColorCategory}
                styles={theme.styles}
              />
            </View>
          </View>
        )}

        {/* Complete Button - Keep your original structure */}
        <View style={styles.completeSection}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              { opacity: loading.isLoading ? 0.7 : 1 }
            ]}
            onPress={handleCharacterCreation}
            disabled={loading.isLoading}
          >
            <Text style={styles.completeButtonText}>
              {loading.isLoading
                ? CHARACTER_CREATOR_CONSTANTS.BUTTONS.CREATING_CHARACTER
                : CHARACTER_CREATOR_CONSTANTS.BUTTONS.COMPLETE_CHARACTER}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0b0f',
  },
  
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  floatingIcon: {
    position: 'absolute',
    fontSize: 24,
    color: '#4ee6e6',
    opacity: 0.3,
  },
  
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 11, 15, 0.8)',
  },
  
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  header: {
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: 30,
  },
  
  forgeTitle: {
    color: '#4ee6e6',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 8,
  },
  
  forgeSubtitle: {
    color: '#d4af37',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 15,
  },
  
  decorativeLine: {
    width: 80,
    height: 2,
    backgroundColor: '#4ee6e6',
    opacity: 0.8,
  },
  
  // Prominent Name Section
  nameSection: {
    backgroundColor: 'rgba(78, 230, 230, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10, // Reduced from 25 to 15
    borderWidth: 2,
    borderColor: '#4ee6e6',
  },
  
  nameLabel: {
    color: '#4ee6e6',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  // Section Titles
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  // Preview Section
  previewSection: {
    backgroundColor: 'rgba(157, 78, 221, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#9d4edd',
  },
  
  previewContainer: {
    alignItems: 'center',
  },
  
  // Style Section
  styleSection: {
    backgroundColor: 'rgba(247, 37, 133, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#f72585',
  },
  
  // Custom Two-Row Grid Layout
  categoryGrid: {
    marginBottom: 5,
  },

  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },

  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 60,
    alignItems: 'center',
  },

  selectedCategoryButton: {
    backgroundColor: 'rgba(78, 230, 230, 0.2)',
    borderColor: '#4ee6e6',
    borderWidth: 1,
  },

  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  selectedCategoryText: {
    color: '#4ee6e6',
  },
  
  // Single Color Section
  colorSection: {
    backgroundColor: 'rgba(255, 214, 10, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#ffd60a',
    alignItems: 'center',
  },
  
  // Complete Section
  completeSection: {
    marginBottom: 40,
  },
  
  completeButton: {
    backgroundColor: '#4ee6e6',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#4ee6e6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  
  completeButtonText: {
    color: '#0a0b0f',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
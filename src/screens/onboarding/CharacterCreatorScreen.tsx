import { router } from "expo-router";
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
  CategorySelector,
  CharacterNameInput,
  CharacterPreviewSection,
  ColorOptionControls,
  StyleControls,
  useMasterState,
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
  const [forgeStep, setForgeStep] = useState<number>(0);

  // Use centralized categories from MasterState context
  const { styleCategories, colorCategories } = character;


  // Disabled automatic character loading to prevent overwriting character name
  // The character data will be loaded when needed, not automatically on mount
  useEffect(() => {
    // Character loading disabled to prevent overwriting user input
  }, []);

  // Track character creation progression
  useEffect(() => {
    const selections = [
      character.selectedBaseModel,
      character.selectedHairStyle,
      character.selectedEyeType,
      character.selectedMouthType,
      character.selectedShirtType
    ];
    
    const completedSelections = selections.filter(val => val > 0).length;
    setForgeStep(completedSelections);
  }, [
    character.selectedBaseModel,
    character.selectedHairStyle,
    character.selectedEyeType,
    character.selectedMouthType,
    character.selectedShirtType
  ]);

  // Logout handler
  const handleLogout = useCallback(async (): Promise<void> => {
    await auth.logout();
  }, [auth]);

  const handleNameChange = useCallback(
    (name: string): void => {
      character.setCharacterName(name);
    },
    [character]
  );

  const handleCategorySelect = useCallback((index: number): void => {
    setSelectedCategory(index);
  }, []);

  // Current style category
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

  // Character creation handler with validation
  const handleCharacterCreation = useCallback(async () => {
    if (!character.characterName || character.characterName.trim() === '') {
      // You could show an alert here if needed
      return;
    }
    
    try {
      await character.createCharacter();
      
      // Navigate to character home screen after successful creation
      router.replace('/(character)/character');
    } catch (error) {
      console.error('Character creation failed:', error);
      // Error handling is already done in the createCharacter method
    }
  }, [character.characterName, character.createCharacter, character]);

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
            onLogout={handleLogout}
            styles={theme.styles}
          />
        </View>

        {/* Character Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>✨ Avatar Preview</Text>
          <View style={styles.previewContainer}>
            <CharacterPreviewSection character={character} styles={theme.styles} />
            
            {/* Progress Indicator */}
            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Forge Progress: {forgeStep}/5</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(forgeStep / 5) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>

        {/* Style Options - Two Rows for Mobile */}
        <View style={styles.styleSection}>
          <Text style={styles.sectionTitle}>🎨 Appearance Options</Text>
          
          {/* Use your original CategorySelector but with custom layout */}
          <CategorySelector
            title={CHARACTER_CREATOR_CONSTANTS.SECTIONS.STYLE_OPTIONS}
            categories={styleCategories}
            selectedIndex={selectedCategory}
            onCategorySelect={handleCategorySelect}
            styles={theme.styles}
            horizontal={true}
          />

          {/* Style Options Display */}
          {currentStyleCategory && (
            <View style={styles.styleOptionsContainer}>
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
            <View style={styles.colorContainer}>
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
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#4ee6e6',
  },
  
  nameLabel: {
    color: '#4ee6e6',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  // Section Titles
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
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
  
  progressSection: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  
  progressLabel: {
    color: '#9d4edd',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(157, 78, 221, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: '#9d4edd',
    borderRadius: 4,
  },
  
  // Style Section
  styleSection: {
    backgroundColor: 'rgba(247, 37, 133, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#f72585',
  },
  
  styleOptionsContainer: {
    marginTop: 15,
  },
  
  // Single Color Section
  colorSection: {
    backgroundColor: 'rgba(255, 214, 10, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#ffd60a',
  },
  
  colorContainer: {
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
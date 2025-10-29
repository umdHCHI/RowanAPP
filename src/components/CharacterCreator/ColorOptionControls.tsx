import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ColorOptionControlsProps } from '../../types/characterCreator';

export const ColorOptionControls: React.FC<ColorOptionControlsProps> = ({
  category,
  styles
}) => {
  const cycle = (idx: number, dir: number) => (idx + dir + category.options) % category.options;

  const handlePrevious = () => {
    const newValue = cycle(category.current, -1);
    category.setter(newValue);
  };

  const handleNext = () => {
    const newValue = cycle(category.current, 1);
    category.setter(newValue);
  };

  return (
    <View style={styles.characterCreatorColorCategory}>
      <Text style={styles.characterCreatorColorCategoryLabel}>{category.label}</Text>
      <View style={styles.characterCreatorColorControls}>
        <TouchableOpacity
          style={styles.characterCreatorColorArrowButton}
          onPress={handlePrevious}
        >
          <Text style={styles.characterCreatorColorArrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.characterCreatorColorOptionText}>
          {category.current + 1} / {category.options}
        </Text>
        <TouchableOpacity
          style={styles.characterCreatorColorArrowButton}
          onPress={handleNext}
        >
          <Text style={styles.characterCreatorColorArrowText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}; 
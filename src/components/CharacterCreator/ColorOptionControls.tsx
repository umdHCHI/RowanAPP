import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CategoryConfig } from '../../types/user';

interface ColorOptionControlsProps {
  category: CategoryConfig;
  styles: any;
}

export const ColorOptionControls: React.FC<ColorOptionControlsProps> = ({
  category,
  styles
}) => {
  const cycle = (idx: number, dir: number) => (idx + dir + category.options) % category.options;

  const handlePrevious = () => {
    category.setter(cycle(category.current, -1));
  };

  const handleNext = () => {
    category.setter(cycle(category.current, 1));
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
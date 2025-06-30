import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CategoryConfig } from '../../types/appearance';

interface StyleControlsProps {
  category: CategoryConfig;
  styles: any;
}

export const StyleControls: React.FC<StyleControlsProps> = ({
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
    <View style={styles.characterCreatorStyleSelectorContainer}>
      <View style={styles.characterCreatorStyleControls}>
        <TouchableOpacity
          style={styles.characterCreatorArrowButton}
          onPress={handlePrevious}
        >
          <Text style={styles.characterCreatorArrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.characterCreatorOptionText}>
          {category.current + 1} / {category.options}
        </Text>
        <TouchableOpacity
          style={styles.characterCreatorArrowButton}
          onPress={handleNext}
        >
          <Text style={styles.characterCreatorArrowText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}; 
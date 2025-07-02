import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { CategoryConfig } from '../../types/user';

interface CategorySelectorProps {
  title: string;
  categories: CategoryConfig[];
  selectedIndex: number;
  onCategorySelect: (index: number) => void;
  styles: any;
  horizontal?: boolean;
  maxHeight?: number;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  title,
  categories,
  selectedIndex,
  onCategorySelect,
  styles,
  horizontal = false,
  maxHeight
}) => {
  return (
    <View style={styles.characterCreatorStyleCategoryContainer}>
      <Text style={styles.characterCreatorSectionTitle}>{title}</Text>
      <ScrollView 
        horizontal={horizontal} 
        showsHorizontalScrollIndicator={false}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.characterCreatorCategoryButton,
              selectedIndex === index && styles.characterCreatorSelectedCategoryButton
            ]}
            onPress={() => onCategorySelect(index)}
          >
            <Text style={[
              styles.characterCreatorCategoryText,
              selectedIndex === index && styles.characterCreatorSelectedCategoryText
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}; 
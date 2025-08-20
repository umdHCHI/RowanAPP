import React from 'react';
import { TextInput, View } from 'react-native';
import { CharacterNameInputProps } from '../../types/characterCreator';

export const CharacterNameInput: React.FC<CharacterNameInputProps> = ({
  characterName,
  onNameChange,
  styles
}) => {
  return (
    <View style={styles.characterCreatorHeader}>
      <TextInput 
        style={styles.characterCreatorNameInput} 
        placeholder='Character Name'
        placeholderTextColor='#999'
        value={characterName}
        onChangeText={onNameChange}
      />
    </View>
  );
}; 
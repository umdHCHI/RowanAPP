import React from 'react';
import { TextInput, View } from 'react-native';

interface CharacterNameInputProps {
  characterName: string;
  onNameChange: (name: string) => void;
  onLogout?: () => void; // Make optional
  styles: any;
}

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
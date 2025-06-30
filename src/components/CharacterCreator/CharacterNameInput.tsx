import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CharacterNameInputProps {
  characterName: string;
  onNameChange: (name: string) => void;
  onLogout: () => void;
  styles: any;
}

export const CharacterNameInput: React.FC<CharacterNameInputProps> = ({
  characterName,
  onNameChange,
  onLogout,
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
      <Text style={styles.characterCreatorTitle}>Create your character</Text>
      <TouchableOpacity
        style={styles.characterCreatorLogoutButton}
        onPress={onLogout}
      >
        <Text style={styles.characterCreatorLogoutButtonText}>Logout and Login Again</Text>
      </TouchableOpacity>
    </View>
  );
}; 
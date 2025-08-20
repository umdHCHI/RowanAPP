import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface SurveyIntroModalProps {
  visible: boolean;
  onStart: () => void;
  styles: any;
}

export const SurveyIntroModal: React.FC<SurveyIntroModalProps> = ({ 
  visible, 
  onStart, 
  styles 
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.card, { margin: 20, maxWidth: 400 }]}>
          <Text style={styles.title}>Discovering Your Path</Text>
          <Text style={styles.text}>
            To create your personalized journey, answer a few metaphorical questions. 
            There are no right or wrong answers—just insights into your unique story.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onStart}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

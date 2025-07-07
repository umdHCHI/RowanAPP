import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VoiceMemoRecorderProps {
  onSave: (audioUri: string) => void;
  theme: any;
}

const VoiceMemoRecorder: React.FC<VoiceMemoRecorderProps> = ({ onSave, theme }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Web Audio API refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Animate bar
  React.useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, { toValue: 1, duration: 300, useNativeDriver: false }),
          Animated.timing(animatedValue, { toValue: 0, duration: 300, useNativeDriver: false }),
        ])
      ).start();
    } else {
      animatedValue.stopAnimation();
      animatedValue.setValue(0);
    }
  }, [isRecording]);

  // Timer
  React.useEffect(() => {
    if (isRecording) {
      const id = window.setInterval(() => setTimer(t => t + 1), 1000);
      setIntervalId(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRecording]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setRecordingUri(null);
      setTimer(0);
      
      if (Platform.OS === 'web') {
        // Web implementation using MediaRecorder API
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setRecordingUri(audioUrl);
          onSave(audioUrl);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } else {
        // Mobile implementation using expo-av
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission to access microphone is required!');
          return;
        }
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await rec.startAsync();
        setRecording(rec);
        setIsRecording(true);
      }
    } catch (err) {
      alert('Failed to start recording: ' + err);
    }
  };

  const stopRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
      } else {
        if (!recording) return;
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        setIsRecording(false);
        setRecordingUri(uri);
        if (uri) onSave(uri);
      }
    } catch (err) {
      alert('Failed to stop recording: ' + err);
    }
  };

  const playRecording = async () => {
    try {
      if (!recordingUri) return;

      if (Platform.OS === 'web') {
        // Web playback using Web Audio API
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }

        const response = await fetch(recordingUri);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        
        if (audioSourceRef.current) {
          audioSourceRef.current.stop();
        }

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
          setIsPlaying(false);
          setPlaybackPosition(0);
        };

        audioSourceRef.current = source;
        source.start(0);
        setIsPlaying(true);
        setPlaybackDuration(audioBuffer.duration);
      } else {
        // Mobile playback using expo-av
        if (sound) {
          await sound.unloadAsync();
        }
        
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: recordingUri },
          { shouldPlay: true }
        );
        
        setSound(newSound);
        setIsPlaying(true);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis / 1000);
            setPlaybackDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlaybackPosition(0);
            }
          }
        });
      }
    } catch (err) {
      alert('Failed to play recording: ' + err);
    }
  };

  const stopPlayback = async () => {
    try {
      if (Platform.OS === 'web') {
        if (audioSourceRef.current) {
          audioSourceRef.current.stop();
          audioSourceRef.current = null;
        }
        setIsPlaying(false);
        setPlaybackPosition(0);
      } else {
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
        }
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    } catch (err) {
      console.error('Failed to stop playback:', err);
    }
  };

  const deleteRecording = () => {
    if (Platform.OS === 'web' && recordingUri) {
      URL.revokeObjectURL(recordingUri);
    }
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
    setRecordingUri(null);
    setIsPlaying(false);
    setPlaybackPosition(0);
    setPlaybackDuration(0);
  };

  // Format timer as mm:ss
  const formatTime = (t: number) => `${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.animatedBar,
            {
              backgroundColor: theme.archiveAccent,
              opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
              height: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [12, 32] }),
            },
          ]}
        />
      </View>
      
      <Text style={[styles.timer, { color: theme.archiveText }]}>{formatTime(timer)}</Text>
      
      {!recordingUri ? (
        <TouchableOpacity
          style={[styles.recordButton, { backgroundColor: isRecording ? theme.archiveAccent : theme.archiveBorder }]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons name={isRecording ? 'stop' : 'mic'} size={32} color={theme.archiveText} />
        </TouchableOpacity>
      ) : (
        <View style={styles.playbackControls}>
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: theme.archiveBorder }]}
            onPress={isPlaying ? stopPlayback : playRecording}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={theme.archiveText} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: theme.archiveAccent }]}
            onPress={deleteRecording}
          >
            <Ionicons name="trash" size={20} color={theme.archiveText} />
          </TouchableOpacity>
        </View>
      )}
      
      {recordingUri && !isRecording && (
        <View style={styles.playbackInfo}>
          <Text style={[styles.playbackText, { color: theme.archiveText }]}>
            {isPlaying ? 'Playing...' : 'Ready to play'}
          </Text>
          {playbackDuration > 0 && (
            <Text style={[styles.playbackTime, { color: theme.archiveSubtext }]}>
              {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1,
    padding: 20 
  },
  barContainer: { 
    height: 40, 
    width: 80, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  animatedBar: { 
    width: 40, 
    borderRadius: 8 
  },
  timer: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  recordButton: { 
    padding: 16, 
    borderRadius: 32, 
    marginTop: 8 
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8
  },
  playButton: {
    padding: 12,
    borderRadius: 24
  },
  deleteButton: {
    padding: 8,
    borderRadius: 16
  },
  playbackInfo: {
    alignItems: 'center',
    marginTop: 16
  },
  playbackText: {
    fontSize: 14,
    marginBottom: 4
  },
  playbackTime: {
    fontSize: 12
  }
});

export default VoiceMemoRecorder; 
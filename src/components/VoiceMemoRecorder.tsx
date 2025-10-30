import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useRef, useState } from 'react';
import { Alert, Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VoiceMemoRecorderProps {
  onSave: (audioUri: string) => void;
  theme: any;
}

const VoiceMemoRecorder: React.FC<VoiceMemoRecorderProps> = ({ onSave, theme }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

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

  React.useEffect(() => {
    if (isRecording) {
      const id = setInterval(() => setTimer(t => t + 1), 1000);
      setIntervalId(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRecording]);

  React.useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setRecordingUri(null);
      setTimer(0);

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission required', 'Please grant microphone permissions to record audio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
    } catch {
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      recordingRef.current = null;
      setIsRecording(false);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      if (uri) {
        setRecordingUri(uri);
        onSave(uri);
      }
    } catch {
      Alert.alert('Recording Error', 'Failed to stop recording. Please try again.');
    }
  };

  const playRecording = async () => {
    try {
      if (!recordingUri) return;

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound, status } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsPlaying(true);

      if (status.isLoaded) {
        setPlaybackDuration((status.durationMillis || 0) / 1000);
      }
    } catch {
      Alert.alert('Playback Error', 'Failed to play recording. Please try again.');
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition((status.positionMillis || 0) / 1000);
      setPlaybackDuration((status.durationMillis || 0) / 1000);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    }
  };

  const stopPlayback = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      await soundRef.current.setPositionAsync(0);
      setIsPlaying(false);
      setPlaybackPosition(0);
    }
  };

  const deleteRecording = async () => {
    if (isPlaying) {
      await stopPlayback();
    }

    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    if (recordingUri && Platform.OS !== 'web') {
      try {
        await FileSystem.deleteAsync(recordingUri);
      } catch {
        // File already deleted or doesn't exist
      }
    }

    setRecordingUri(null);
    setIsPlaying(false);
    setPlaybackPosition(0);
    setPlaybackDuration(0);
    setTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        {isRecording && (
          <>
            <Animated.View
              style={[
                styles.animatedBar,
                {
                  backgroundColor: theme.archiveAccent || '#4ee6e6',
                  opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
                  height: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [20, 50] }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.animatedBar,
                {
                  backgroundColor: theme.archiveAccent || '#4ee6e6',
                  opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }),
                  height: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 20] }),
                  marginLeft: 8,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.animatedBar,
                {
                  backgroundColor: theme.archiveAccent || '#4ee6e6',
                  opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
                  height: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [30, 40] }),
                  marginLeft: 8,
                },
              ]}
            />
          </>
        )}
      </View>

      <Text style={[styles.timer, { color: theme.archiveText || '#fff' }]}>
        {isRecording ? formatTime(timer) : recordingUri ? 'Recording Ready' : 'Ready to Record'}
      </Text>

      {!recordingUri ? (
        <TouchableOpacity
          style={[
            styles.recordButton,
            {
              backgroundColor: isRecording ? '#ff6b6b' : (theme.archiveAccent || '#4ee6e6'),
              borderWidth: 2,
              borderColor: theme.archiveBorder || '#d4af37',
            }
          ]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons name={isRecording ? 'stop' : 'mic'} size={40} color={theme.archiveText || '#fff'} />
        </TouchableOpacity>
      ) : (
        <View style={styles.playbackControls}>
          <TouchableOpacity
            style={[
              styles.playButton,
              {
                backgroundColor: theme.archiveAccent || '#4ee6e6',
                borderWidth: 2,
                borderColor: theme.archiveBorder || '#d4af37',
              }
            ]}
            onPress={isPlaying ? stopPlayback : playRecording}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color={theme.archiveText || '#fff'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              {
                backgroundColor: '#ff6b6b',
                borderWidth: 2,
                borderColor: theme.archiveBorder || '#d4af37',
              }
            ]}
            onPress={deleteRecording}
          >
            <Ionicons name="trash" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {recordingUri && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.archiveBorder || '#3a3d45' }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.archiveAccent || '#4ee6e6',
                  width: playbackDuration > 0 ? `${(playbackPosition / playbackDuration) * 100}%` : '0%'
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.archiveText || '#fff' }]}>
            {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
          </Text>
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
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  animatedBar: {
    width: 8,
    borderRadius: 4
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    letterSpacing: 2
  },
  recordButton: {
    padding: 20,
    borderRadius: 50,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 16
  },
  playButton: {
    padding: 16,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteButton: {
    padding: 12,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600'
  }
});

export default VoiceMemoRecorder;

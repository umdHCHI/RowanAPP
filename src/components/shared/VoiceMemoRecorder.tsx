import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Native (Android/iOS) refs
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Web refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingDurationRef = useRef(0);

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
      timerIntervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  React.useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
      // Cleanup web audio
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Cleanup native audio
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setRecordingUri(null);
      setTimer(0);
      recordingDurationRef.current = 0;

      if (Platform.OS === 'web') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setRecordingUri(audioUrl);
          onSave(audioUrl);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } else {
        // Native (Android/iOS) implementation
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        recordingRef.current = recording;
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Recording start error:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        recordingDurationRef.current = timer;
        setPlaybackDuration(timer);
      } else {
        // Native (Android/iOS) implementation
        if (!recordingRef.current) return;

        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();

        if (uri) {
          setRecordingUri(uri);
          onSave(uri);

          // Get duration
          const { sound } = await Audio.Sound.createAsync({ uri });
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            const durationSeconds = (status.durationMillis || 0) / 1000;
            setPlaybackDuration(durationSeconds);
            recordingDurationRef.current = durationSeconds;
          }
          await sound.unloadAsync();
        }

        setIsRecording(false);
        recordingRef.current = null;
      }
    } catch (error) {
      console.error('Recording stop error:', error);
      Alert.alert('Recording Error', 'Failed to stop recording. Please try again.');
    }
  };

  const playRecording = async () => {
    try {
      if (!recordingUri) return;

      if (Platform.OS === 'web') {
        // Use HTML Audio element for simpler playback
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          audioElementRef.current = null;
        }

        const audio = new (window as any).Audio(recordingUri) as HTMLAudioElement;
        audioElementRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
          setPlaybackPosition(0);
          if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current);
          }
        };

        audio.onloadedmetadata = () => {
          setPlaybackDuration(audio.duration);
        };

        await audio.play();
        setIsPlaying(true);

        playbackIntervalRef.current = setInterval(() => {
          if (audioElementRef.current) {
            setPlaybackPosition(audioElementRef.current.currentTime);
          }
        }, 100);
      } else {
        // Native (Android/iOS) implementation
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: recordingUri },
          { shouldPlay: true }
        );

        soundRef.current = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.isPlaying) {
              setPlaybackPosition((status.positionMillis || 0) / 1000);
              setPlaybackDuration((status.durationMillis || 0) / 1000);
            }
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlaybackPosition(0);
            }
          }
        });

        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Playback Error', 'Failed to play recording. Please try again.');
    }
  };

  const stopPlayback = async () => {
    try {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }

      if (Platform.OS === 'web') {
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          audioElementRef.current.currentTime = 0;
        }
      } else {
        // Native (Android/iOS) implementation
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.setPositionAsync(0);
        }
      }

      setIsPlaying(false);
      setPlaybackPosition(0);
    } catch (error) {
      console.error('Stop playback error:', error);
    }
  };

  const deleteRecording = async () => {
    try {
      if (isPlaying) {
        await stopPlayback();
      }

      if (Platform.OS === 'web' && recordingUri) {
        URL.revokeObjectURL(recordingUri);
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          audioElementRef.current = null;
        }
      } else if (Platform.OS !== 'web' && recordingUri) {
        // Clean up native sound
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        // Delete the file - just try to delete it, no need to check if it exists first
        try {
          await FileSystem.deleteAsync(recordingUri);
        } catch (error) {
          // Ignore errors if file doesn't exist or can't be deleted
          console.log('Could not delete recording file:', error);
        }
      }

      setRecordingUri(null);
      setIsPlaying(false);
      setPlaybackPosition(0);
      setPlaybackDuration(0);
      setTimer(0);
      recordingDurationRef.current = 0;
    } catch (error) {
      console.error('Delete recording error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      
      {recordingUri && playbackDuration > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.archiveBorder }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: theme.archiveAccent,
                  width: `${Math.min((playbackPosition / playbackDuration) * 100, 100)}%`
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.archiveText }]}>
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
  progressContainer: {
    alignItems: 'center',
    marginTop: 16,
    width: '100%'
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    fontSize: 12,
    marginTop: 4
  }
});

export default VoiceMemoRecorder;
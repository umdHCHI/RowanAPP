import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';

interface AudioPlayerProps {
  audioUrl: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAudio = async () => {
    if (!audioUrl) {
      setError('No audio file available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      if (!isMounted.current) {
        await newSound.unloadAsync();
        return;
      }

      setSound(newSound);

      if (status.isLoaded) {
        setDuration((status.durationMillis || 0) / 1000);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Unable to load audio file');
        console.error('Audio load error:', err);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (!isMounted.current) return;

    if (status.isLoaded) {
      setPosition((status.positionMillis || 0) / 1000);
      setDuration((status.durationMillis || 0) / 1000);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        if (sound) {
          sound.setPositionAsync(0);
        }
      }
    } else if (status.error) {
      setError(`Playback error: ${status.error}`);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (!sound) {
        await loadAudio();
        return;
      }

      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (err) {
      Alert.alert('Playback Error', 'Failed to play audio. Please try again.');
      console.error('Play/pause error:', err);
    }
  };

  const handleStop = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setPosition(0);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Stop error:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={32} color="#cc0000" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>
          {audioUrl.startsWith('file://')
            ? 'Local recording may have been deleted'
            : 'Unable to access audio file'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="mic" size={32} color="#4ee6e6" />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.playButton, isLoading && styles.disabledButton]}
          onPress={handlePlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="#fff"
            />
          )}
        </TouchableOpacity>

        {sound && (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStop}
            disabled={!isPlaying && position === 0}
          >
            <Ionicons name="stop" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
        </View>
      </View>

      {sound && duration > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(position / duration) * 100}%` }
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4ee6e6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  timeContainer: {
    minWidth: 80,
  },
  timeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ee6e6',
    borderRadius: 3,
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorText: {
    fontSize: 14,
    color: '#cc0000',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#cc0000',
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default AudioPlayer;

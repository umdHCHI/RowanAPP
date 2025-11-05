import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface DrawingViewerProps {
  drawingData: string;
}

type Stroke = {
  points: { x: number; y: number }[];
  color: string;
  width: number;
};

const DrawingViewer: React.FC<DrawingViewerProps> = ({ drawingData }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!drawingData) {
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderIcon}>🎨</Text>
        <Text style={styles.placeholderText}>No drawing data available</Text>
      </View>
    );
  }

  try {
    // Case 1: Check if it's a base64 image (starts with data:image)
    if (drawingData.startsWith('data:image')) {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: drawingData }}
            style={styles.drawingImage}
            resizeMode="contain"
            onError={() => setError('Failed to load drawing image')}
          />
          {loading && <ActivityIndicator size="large" color="#4ee6e6" style={styles.loader} />}
        </View>
      );
    }

    // Case 2: Check if it's a URL to an uploaded image
    if (drawingData.startsWith('http://') || drawingData.startsWith('https://')) {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: drawingData }}
            style={styles.drawingImage}
            resizeMode="contain"
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => setError('Failed to load drawing from server')}
          />
          {loading && <ActivityIndicator size="large" color="#4ee6e6" style={styles.loader} />}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      );
    }

    // Case 3: Try to parse as JSON stroke data
    let strokes: any[] = [];
    try {
      strokes = JSON.parse(drawingData);
    } catch (parseError) {
      throw new Error('Invalid drawing data format');
    }

    // Check if the stroke data contains imageData (base64 encoded image)
    if (Array.isArray(strokes) && strokes.length > 0) {
      const strokeWithImage = strokes.find(stroke => stroke.imageData);
      if (strokeWithImage && strokeWithImage.imageData) {
        // We have a base64 image stored in the stroke data
        return (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: strokeWithImage.imageData }}
              style={styles.drawingImage}
              resizeMode="contain"
              onError={() => setError('Failed to load drawing image')}
            />
            {loading && <ActivityIndicator size="large" color="#4ee6e6" style={styles.loader} />}
          </View>
        );
      }
    }

    // Check if we have valid stroke data with actual points
    const hasValidStrokes = Array.isArray(strokes) && strokes.length > 0 &&
                            strokes.some(stroke => stroke.points && stroke.points.length > 0);

    if (!hasValidStrokes) {
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>🎨</Text>
          <Text style={styles.placeholderText}>Drawing preview not available</Text>
          <Text style={styles.placeholderSubtext}>
            This drawing was created but the preview data wasn't captured properly.
          </Text>
        </View>
      );
    }

    // If we have valid stroke data, we would need to render it on a canvas
    // For now, show a message that the drawing exists
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderIcon}>🎨</Text>
        <Text style={styles.placeholderText}>Drawing Entry</Text>
        <Text style={styles.placeholderSubtext}>
          Contains {strokes.length} stroke{strokes.length !== 1 ? 's' : ''}
        </Text>
      </View>
    );

  } catch (err) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Unable to display drawing</Text>
        <Text style={styles.errorSubtext}>
          {err instanceof Error ? err.message : 'Unknown error'}
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    minHeight: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  drawingImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    position: 'absolute',
  },
  placeholderContainer: {
    padding: 32,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorContainer: {
    padding: 24,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#cc0000',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#cc0000',
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default DrawingViewer;

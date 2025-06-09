import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

type Point = {
  x: number;
  y: number;
};

type Stroke = {
  points: Point[];
  color: string;
  width: number;
};

type DrawingCanvasProps = {
  onSave: (paths: Stroke[]) => void;
  onCancel: () => void;
};

const DrawingCanvas = ({ onSave, onCancel }: DrawingCanvasProps) => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [selectedColor, setSelectedColor] = useState('#4ee6e6');
  const [selectedWidth, setSelectedWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);

  const colors = ['#4ee6e6', '#ffe066', '#ff6b6b', '#ffffff'];
  const widths = [2, 3, 5, 8];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        setIsDrawing(true);
        setCurrentStroke({
          points: [{ x: locationX, y: locationY }],
          color: selectedColor,
          width: selectedWidth,
        });
      },
      onPanResponderMove: (event) => {
        if (!isDrawing) return;
        const { locationX, locationY } = event.nativeEvent;
        setCurrentStroke((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            points: [...prev.points, { x: locationX, y: locationY }],
          };
        });
      },
      onPanResponderRelease: () => {
        if (currentStroke) {
          setStrokes((prev) => [...prev, currentStroke]);
        }
        setCurrentStroke(null);
        setIsDrawing(false);
      },
    })
  ).current;

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
  };

  const getPathFromPoints = (points: Point[]) => {
    if (points.length < 2) return '';
    const [first, ...rest] = points;
    return `M ${first.x} ${first.y} ${rest
      .map((point) => `L ${point.x} ${point.y}`)
      .join(' ')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.colorPicker}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
        <View style={styles.widthPicker}>
          {widths.map((width) => (
            <TouchableOpacity
              key={width}
              style={[
                styles.widthOption,
                { width: width * 2, height: width * 2 },
                selectedWidth === width && styles.selectedWidth,
              ]}
              onPress={() => setSelectedWidth(width)}
            />
          ))}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleUndo}>
            <Ionicons name="arrow-undo" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleClear}>
            <Ionicons name="trash" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={styles.canvas}
        {...panResponder.panHandlers}
      >
        <Svg style={StyleSheet.absoluteFill}>
          {strokes.map((stroke, index) => (
            <Path
              key={index}
              d={getPathFromPoints(stroke.points)}
              stroke={stroke.color}
              strokeWidth={stroke.width}
              fill="none"
            />
          ))}
          {currentStroke && (
            <Path
              d={getPathFromPoints(currentStroke.points)}
              stroke={currentStroke.color}
              strokeWidth={currentStroke.width}
              fill="none"
            />
          )}
        </Svg>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSave(strokes)}
        >
          <Text style={styles.buttonText}>Save Drawing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#23242b',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 10,
  },
  colorOption: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  selectedColor: {
    borderColor: '#fff',
  },
  widthPicker: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  widthOption: {
    backgroundColor: '#fff',
    borderRadius: 50,
  },
  selectedWidth: {
    borderWidth: 2,
    borderColor: '#4ee6e6',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#1a1b1f',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#23242b',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#4ee6e6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DrawingCanvas; 
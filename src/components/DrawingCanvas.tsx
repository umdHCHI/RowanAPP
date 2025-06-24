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
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../styles/globalStyles';

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
  const { theme } = useTheme();
  const globalStyles = createGlobalStyles(theme);
  
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
    <View style={globalStyles.drawingCanvasContainer}>
      <View style={globalStyles.drawingCanvasToolbar}>
        <View style={globalStyles.drawingCanvasColorPicker}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                globalStyles.drawingCanvasColorOption,
                { backgroundColor: color },
                selectedColor === color && globalStyles.drawingCanvasSelectedColor,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
        <View style={globalStyles.drawingCanvasWidthPicker}>
          {widths.map((width) => (
            <TouchableOpacity
              key={width}
              style={[
                globalStyles.drawingCanvasWidthOption,
                { width: width * 2, height: width * 2 },
                selectedWidth === width && globalStyles.drawingCanvasSelectedWidth,
              ]}
              onPress={() => setSelectedWidth(width)}
            />
          ))}
        </View>
        <View style={globalStyles.drawingCanvasActions}>
          <TouchableOpacity style={globalStyles.drawingCanvasActionButton} onPress={handleUndo}>
            <Ionicons name="arrow-undo" size={24} color={theme.archiveText} />
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.drawingCanvasActionButton} onPress={handleClear}>
            <Ionicons name="trash" size={24} color={theme.archiveText} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={globalStyles.drawingCanvasCanvas}
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

      <View style={globalStyles.drawingCanvasBottomBar}>
        <TouchableOpacity style={globalStyles.drawingCanvasCancelButton} onPress={onCancel}>
          <Text style={globalStyles.drawingCanvasButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={globalStyles.drawingCanvasSaveButton}
          onPress={() => onSave(strokes)}
        >
          <Text style={globalStyles.drawingCanvasButtonText}>Save Drawing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DrawingCanvas; 
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    PanResponder,
    Platform,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');
const isMobile = width < 600;
const isWeb = Platform.OS === 'web';

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
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke | null>(null);

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
        console.log('PanResponderGrant fired!', locationX, locationY);
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
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const newStrokes = prev.slice(0, -1);
      setRedoStack((redo) => [prev[prev.length - 1], ...redo]);
      return newStrokes;
    });
  };

  const handleRedo = () => {
    setRedoStack((redo) => {
      if (redo.length === 0) return redo;
      setStrokes((prev) => [...prev, redo[0]]);
      return redo.slice(1);
    });
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
    setRedoStack([]);
  };

  const getPathFromPoints = (points: Point[]) => {
    if (points.length < 2) return '';
    const [first, ...rest] = points;
    return `M ${first.x} ${first.y} ${rest
      .map((point) => `L ${point.x} ${point.y}`)
      .join(' ')}`;
  };

  // Web pointer event handlers using global listeners
  useEffect(() => {
    if (!isWeb) return;
    // Cleanup on unmount
    return () => {
      window.removeEventListener('pointermove', globalPointerMove);
      window.removeEventListener('pointerup', globalPointerUp);
    };
  }, []);

  const globalPointerMove = (e: any) => {
    if (!drawingRef.current) return;
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    const pressure = e.pressure || 0.5;
    if (currentStrokeRef.current) {
      currentStrokeRef.current = {
        ...currentStrokeRef.current,
        points: [...currentStrokeRef.current.points, { x, y }],
        width: pressure * 8 || selectedWidth,
      };
      setCurrentStroke({ ...currentStrokeRef.current }); // trigger re-render
    }
  };
  const globalPointerUp = (e: any) => {
    drawingRef.current = false;
    window.removeEventListener('pointermove', globalPointerMove);
    window.removeEventListener('pointerup', globalPointerUp);
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
      setStrokes((prev) => [...prev, currentStrokeRef.current!]);
    }
    setCurrentStroke(null);
    currentStrokeRef.current = null;
    setIsDrawing(false);
  };
  const svgRef = useRef<SVGSVGElement>(null);
  const pointerDown = (e: any) => {
    if (!isWeb) return;
    // Pointer capture for continuous drawing
    if (e.target && e.target.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }
    // If a stroke is in progress, finalize it
    if (currentStroke && currentStroke.points.length > 1) {
      setStrokes((prev) => [...prev, currentStroke]);
      setCurrentStroke(null);
      currentStrokeRef.current = null;
    }
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure || 0.5;
    drawingRef.current = true;
    setIsDrawing(true);
    const newStroke = {
      points: [{ x, y }],
      color: selectedColor,
      width: pressure * 8 || selectedWidth,
    };
    setCurrentStroke(newStroke);
    currentStrokeRef.current = newStroke;
    setRedoStack([]); // Clear redo stack on new stroke
    window.addEventListener('pointermove', globalPointerMove);
    window.addEventListener('pointerup', globalPointerUp);
  };

  return (
    <View style={isMobile ? globalStyles.drawingCanvasContainerMobile : globalStyles.drawingCanvasContainer}>
      <View style={isMobile ? globalStyles.drawingCanvasToolbarMobile : globalStyles.drawingCanvasToolbar}>
        <View style={globalStyles.drawingCanvasColorPicker}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                globalStyles.drawingCanvasColorOption,
                { backgroundColor: color },
                selectedColor === color && globalStyles.drawingCanvasSelectedColor,
                isMobile && { width: 32, height: 32, borderRadius: 16 },
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
        <View style={globalStyles.drawingCanvasWidthPicker}>
          {widths.map((w) => (
            <TouchableOpacity
              key={w}
              style={[
                globalStyles.drawingCanvasWidthOption,
                { width: w * (isMobile ? 3 : 2), height: w * (isMobile ? 3 : 2) },
                selectedWidth === w && globalStyles.drawingCanvasSelectedWidth,
              ]}
              onPress={() => setSelectedWidth(w)}
            />
          ))}
        </View>
        <View style={globalStyles.drawingCanvasActions}>
          <TouchableOpacity style={globalStyles.drawingCanvasActionButton} onPress={handleUndo}>
            <Ionicons name="arrow-undo" size={isMobile ? 32 : 24} color={theme.archiveText} />
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.drawingCanvasActionButton} onPress={handleRedo}>
            <Ionicons name="arrow-redo" size={isMobile ? 32 : 24} color={theme.archiveText} />
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.drawingCanvasActionButton} onPress={handleClear}>
            <Ionicons name="trash" size={isMobile ? 32 : 24} color={theme.archiveText} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={isMobile ? globalStyles.drawingCanvasCanvasMobile : globalStyles.drawingCanvasCanvas}
      >
        {isWeb ? (
          <svg
            ref={svgRef}
            width={width - 32}
            height={height / 2}
            style={{ display: 'block', width: '100%', height: '100%' }}
          >
            {Array.isArray(strokes) && strokes.map((stroke, index) => (
              stroke && stroke.points && stroke.points.length > 0 ? (
                <path
                  key={index}
                  d={getPathFromPoints(stroke.points)}
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null
            ))}
            {currentStroke && currentStroke.points && currentStroke.points.length > 0 && (
              <path
                d={getPathFromPoints(currentStroke.points)}
                stroke={currentStroke.color}
                strokeWidth={currentStroke.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            <rect
              x={0}
              y={0}
              width={width - 32}
              height={height / 2}
              fill="transparent"
              pointerEvents="all"
              onPointerDown={pointerDown}
            />
          </svg>
        ) : (
          <Svg
            width={width - 32}
            height={height / 2}
            style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
          >
            {Array.isArray(strokes) && strokes.map((stroke, index) => (
              stroke && stroke.points && stroke.points.length > 0 ? (
                <Path
                  key={index}
                  d={getPathFromPoints(stroke.points)}
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  fill="none"
                />
              ) : null
            ))}
            {currentStroke && currentStroke.points && currentStroke.points.length > 0 && (
              <Path
                d={getPathFromPoints(currentStroke.points)}
                stroke={currentStroke.color}
                strokeWidth={currentStroke.width}
                fill="none"
              />
            )}
          </Svg>
        )}
      </View>

      <View style={isMobile ? globalStyles.drawingCanvasBottomBarMobile : globalStyles.drawingCanvasBottomBar}>
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
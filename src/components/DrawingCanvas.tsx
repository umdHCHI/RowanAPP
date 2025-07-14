import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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
  const canvasRef = useRef<View>(null);
  const svgRef = useRef<any>(null);

  const colors = ['#4ee6e6', '#ffe066', '#ff6b6b', '#ffffff'];
  const widths = [2, 3, 5, 8];

  // Calculate canvas dimensions - make it smaller for mobile
  const canvasWidth = isMobile ? width - 48 : width - 32;
  const canvasHeight = isMobile ? height / 4 : height / 2; // Make it even smaller on mobile

  // Add a test stroke for debugging
  useEffect(() => {
    if (isMobile && strokes.length === 0) {
      console.log('Drawing canvas ready for mobile drawing');
    }
  }, [isMobile, strokes.length]);

  // Create gesture for mobile drawing
  const panGesture = Gesture.Pan()
    .minDistance(0)
    .runOnJS(true)
    .onStart((event) => {
      try {
        // Ensure coordinates are within canvas bounds
        const x = Math.max(0, Math.min(event.x, canvasWidth));
        const y = Math.max(0, Math.min(event.y, canvasHeight));
        
        // Create a simple stroke object
        const newStroke: Stroke = {
          points: [{ x, y }],
          color: selectedColor,
          width: selectedWidth,
        };
        
        // Update state safely
        setIsDrawing(true);
        setCurrentStroke(newStroke);
        currentStrokeRef.current = newStroke;
      } catch (error) {
        console.error('Error in gesture onStart:', error);
        // Reset state on error
        setIsDrawing(false);
        setCurrentStroke(null);
        currentStrokeRef.current = null;
      }
    })
    .onUpdate((event) => {
      try {
        if (!isDrawing || !currentStrokeRef.current) return;
        
        // Ensure coordinates are within canvas bounds
        const x = Math.max(0, Math.min(event.x, canvasWidth));
        const y = Math.max(0, Math.min(event.y, canvasHeight));
        
        // Update the ref directly
        if (currentStrokeRef.current) {
          currentStrokeRef.current.points.push({ x, y });
          
          // Update state with the new stroke
          setCurrentStroke({
            ...currentStrokeRef.current,
            points: [...currentStrokeRef.current.points]
          });
        }
      } catch (error) {
        console.error('Error in gesture onUpdate:', error);
      }
    })
    .onEnd(() => {
      try {
        // Get the stroke to save
        const strokeToSave = currentStrokeRef.current;
        
        if (strokeToSave && strokeToSave.points.length > 1) {
          // Add to strokes array
          setStrokes((prev) => {
            const newStrokes = [...prev, strokeToSave];
            return newStrokes;
          });
        }
        
        // Clean up
        setCurrentStroke(null);
        currentStrokeRef.current = null;
        setIsDrawing(false);
      } catch (error) {
        console.error('Error in gesture onEnd:', error);
        // Clean up on error
        setCurrentStroke(null);
        currentStrokeRef.current = null;
        setIsDrawing(false);
      }
    });

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
      if (typeof window !== 'undefined') {
        (window as any).removeEventListener('pointermove', globalPointerMove);
        (window as any).removeEventListener('pointerup', globalPointerUp);
      }
    };
  }, []);

  const globalPointerMove = (e: any) => {
    if (!drawingRef.current) return;
    const svgElement = svgRef.current as any;
    const svgRect = svgElement?.getBoundingClientRect();
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
    if (typeof window !== 'undefined') {
      (window as any).removeEventListener('pointermove', globalPointerMove);
      (window as any).removeEventListener('pointerup', globalPointerUp);
    }
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
      setStrokes((prev) => [...prev, currentStrokeRef.current!]);
    }
    setCurrentStroke(null);
    currentStrokeRef.current = null;
    setIsDrawing(false);
  };
  
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
    if (typeof window !== 'undefined') {
      (window as any).addEventListener('pointermove', globalPointerMove);
      (window as any).addEventListener('pointerup', globalPointerUp);
    }
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

      <GestureDetector gesture={panGesture}>
        <View
          ref={canvasRef}
          style={{
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: theme.archiveMode === 'dark' ? '#0F172A' : '#FFFFFF',
            borderWidth: 1,
            borderColor: theme.archiveBorder,
            borderRadius: 8,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {isWeb ? (
            <svg
              ref={svgRef}
              width={canvasWidth}
              height={canvasHeight}
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
                width={canvasWidth}
                height={canvasHeight}
                fill="transparent"
                pointerEvents="all"
                onPointerDown={pointerDown}
              />
            </svg>
          ) : (
            <Svg
              width={canvasWidth}
              height={canvasHeight}
              style={{ 
                position: 'absolute', 
                left: 0, 
                top: 0, 
                width: canvasWidth, 
                height: canvasHeight
              }}
            >
              {Array.isArray(strokes) && strokes.map((stroke, index) => {
                try {
                  if (stroke && stroke.points && stroke.points.length > 0) {
                    return (
                      <Path
                        key={index}
                        d={getPathFromPoints(stroke.points)}
                        stroke={stroke.color}
                        strokeWidth={stroke.width}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                  }
                } catch (error) {
                  console.error('Error rendering stroke:', error);
                }
                return null;
              })}
              {currentStroke && currentStroke.points && currentStroke.points.length > 0 && (
                <Path
                  d={getPathFromPoints(currentStroke.points)}
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          )}
        </View>
      </GestureDetector>

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
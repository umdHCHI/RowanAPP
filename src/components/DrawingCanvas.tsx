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
  hideButtons?: boolean;
  onStrokesChange?: (paths: Stroke[]) => void;
};

const DrawingCanvas = ({ onSave, onCancel, hideButtons = false, onStrokesChange }: DrawingCanvasProps) => {
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

  const [canvasDimensions, setCanvasDimensions] = useState({ width: 300, height: 200 });

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .runOnJS(true)
    .onStart((event) => {
      try {
        const x = Math.max(0, Math.min(event.x, canvasDimensions.width));
        const y = Math.max(0, Math.min(event.y, canvasDimensions.height));
        
        const newStroke: Stroke = {
          points: [{ x, y }],
          color: selectedColor,
          width: selectedWidth,
        };
        
        setIsDrawing(true);
        setCurrentStroke(newStroke);
        currentStrokeRef.current = newStroke;
      } catch {
        setIsDrawing(false);
        setCurrentStroke(null);
        currentStrokeRef.current = null;
      }
    })
    .onUpdate((event) => {
      try {
        if (!isDrawing || !currentStrokeRef.current) return;
        
        const x = Math.max(0, Math.min(event.x, canvasDimensions.width));
        const y = Math.max(0, Math.min(event.y, canvasDimensions.height));
        
        if (currentStrokeRef.current) {
          currentStrokeRef.current.points.push({ x, y });
          
          setCurrentStroke({
            ...currentStrokeRef.current,
            points: [...currentStrokeRef.current.points]
          });
        }
      } catch {
      }
    })
    .onEnd(() => {
      try {
        const strokeToSave = currentStrokeRef.current;
        
        if (strokeToSave && strokeToSave.points.length > 1) {
          setStrokes((prev) => {
            const newStrokes = [...prev, strokeToSave];
            onStrokesChange?.(newStrokes);
            return newStrokes;
          });
        }
        
        setCurrentStroke(null);
        currentStrokeRef.current = null;
        setIsDrawing(false);
      } catch {
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
      onStrokesChange?.(newStrokes);
      return newStrokes;
    });
  };

  const handleRedo = () => {
    setRedoStack((redo) => {
      if (redo.length === 0) return redo;
      setStrokes((prev) => {
        const newStrokes = [...prev, redo[0]];
        onStrokesChange?.(newStrokes);
        return newStrokes;
      });
      return redo.slice(1);
    });
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
    setRedoStack([]);
    onStrokesChange?.([]);
  };

  const getPathFromPoints = (points: Point[]) => {
    if (points.length < 2) return '';
    const [first, ...rest] = points;
    return `M ${first.x} ${first.y} ${rest
      .map((point) => `L ${point.x} ${point.y}`)
      .join(' ')}`;
  };

  useEffect(() => {
    if (!isWeb) return;
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
      setStrokes((prev) => {
        const newStrokes = [...prev, currentStrokeRef.current!];
        onStrokesChange?.(newStrokes);
        return newStrokes;
      });
    }
    setCurrentStroke(null);
    currentStrokeRef.current = null;
    setIsDrawing(false);
  };
  
  const pointerDown = (e: any) => {
    if (!isWeb) return;
    if (e.target && e.target.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }
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
    setRedoStack([]);
    if (typeof window !== 'undefined') {
      (window as any).addEventListener('pointermove', globalPointerMove);
      (window as any).addEventListener('pointerup', globalPointerUp);
    }
  };

  return (
    <View style={[
      { flex: 1, flexDirection: 'column' },
      hideButtons && { gap: 8 }
    ]}>
      <View style={[
        isMobile ? globalStyles.drawingCanvasToolbarMobile : globalStyles.drawingCanvasToolbar,
        { 
          flexShrink: 0, 
          minHeight: 60,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 8,
          paddingHorizontal: 12
        }
      ]}>
        <View style={[globalStyles.drawingCanvasColorPicker, { flexDirection: 'row', gap: 8, flexWrap: 'wrap' }]}>
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
        <View style={[globalStyles.drawingCanvasWidthPicker, { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }]}>
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
        <View style={[globalStyles.drawingCanvasActions, { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }]}>
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
            flex: 1,
            backgroundColor: theme.archiveMode === 'dark' ? '#0F172A' : '#FFFFFF',
            borderWidth: 1,
            borderColor: theme.archiveBorder,
            borderRadius: 8,
            overflow: 'hidden',
            position: 'relative'
          }}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            if (width > 0 && height > 0) {
              setCanvasDimensions({ width, height });
            }
          }}
        >
          {isWeb ? (
            <svg
              ref={svgRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
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
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                fill="transparent"
                pointerEvents="all"
                onPointerDown={pointerDown}
              />
            </svg>
          ) : (
            <Svg
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              style={{ 
                position: 'absolute', 
                left: 0, 
                top: 0, 
                width: canvasDimensions.width, 
                height: canvasDimensions.height
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
                } catch {
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

      {!hideButtons && (
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
      )}
    </View>
  );
};

export default DrawingCanvas; 
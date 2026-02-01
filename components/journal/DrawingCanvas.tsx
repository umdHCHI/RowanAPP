import React, { useState, useRef, useMemo, useCallback } from 'react'
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Pressable } from 'react-native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import { runOnJS } from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export interface Stroke {
  points: Array<{ x: number; y: number }>
  color?: string
  width?: number
}

interface DrawingCanvasProps {
  value: Stroke[]
  onChange: (strokes: Stroke[]) => void
  onDrawingStart?: () => void
  onDrawingEnd?: () => void
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CANVAS_WIDTH = SCREEN_WIDTH - 80 // Account for padding
const CANVAS_HEIGHT = 300
const STROKE_COLOR = '#FFD700' // Gold accent (fallback)
const STROKE_WIDTH = 3

const COLORS = [
  '#F5F5F5', // soft white
  '#F2C94C', // gold
  '#EB5757', // muted red
  '#6FCF97', // calm green
  '#56CCF2', // soft blue
  '#BB6BD9', // lavender
]

export function DrawingCanvas({ value, onChange, onDrawingStart, onDrawingEnd }: DrawingCanvasProps) {
  const [strokeColor, setStrokeColor] = useState('#F5F5F5')
  const strokeColorRef = useRef('#F5F5F5')
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)
  const currentStrokeRef = useRef<Stroke | null>(null)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)
  const onDrawingStartRef = useRef(onDrawingStart)
  const onDrawingEndRef = useRef(onDrawingEnd)

  // Keep refs in sync
  onChangeRef.current = onChange
  valueRef.current = value
  onDrawingStartRef.current = onDrawingStart
  onDrawingEndRef.current = onDrawingEnd
  strokeColorRef.current = strokeColor

  const handleStrokeStart = useCallback((x: number, y: number) => {
    const newStroke: Stroke = {
      points: [{ x, y }],
      color: strokeColorRef.current,
      width: STROKE_WIDTH,
    }
    currentStrokeRef.current = newStroke
    setCurrentStroke(newStroke)
  }, [])

  const handleStrokeUpdate = useCallback((x: number, y: number) => {
    if (currentStrokeRef.current) {
      currentStrokeRef.current.points.push({ x, y })
      setCurrentStroke({
        ...currentStrokeRef.current,
        points: [...currentStrokeRef.current.points],
      })
    }
  }, [])

  const handleStrokeEnd = useCallback(() => {
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      onChangeRef.current([...valueRef.current, currentStrokeRef.current])
      currentStrokeRef.current = null
      setCurrentStroke(null)
    }
  }, [])

  const handleDrawingStart = useCallback(() => {
    onDrawingStartRef.current?.()
  }, [])

  const handleDrawingEnd = useCallback(() => {
    onDrawingEndRef.current?.()
  }, [])

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .failOffsetY([-25, 25])
        .onStart((event) => {
          runOnJS(handleDrawingStart)()
          runOnJS(handleStrokeStart)(event.x, event.y)
        })
        .onUpdate((event) => {
          runOnJS(handleStrokeUpdate)(event.x, event.y)
        })
        .onEnd(() => {
          runOnJS(handleStrokeEnd)()
          runOnJS(handleDrawingEnd)()
        })
        .onFinalize(() => {
          runOnJS(handleDrawingEnd)()
        }),
    [handleStrokeStart, handleStrokeUpdate, handleStrokeEnd, handleDrawingStart, handleDrawingEnd]
  )

  function handleUndo() {
    if (value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function handleClear() {
    onChange([])
  }

  function pathFromStroke(stroke: Stroke): string {
    if (stroke.points.length === 0) return ''
    if (stroke.points.length === 1) {
      const p = stroke.points[0]
      return `M ${p.x} ${p.y} L ${p.x} ${p.y}`
    }
    
    let path = `M ${stroke.points[0].x} ${stroke.points[0].y}`
    for (let i = 1; i < stroke.points.length; i++) {
      path += ` L ${stroke.points[i].x} ${stroke.points[i].y}`
    }
    return path
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Draw your reflection here</Text>
      
      {/* Color Palette */}
      <View style={styles.colorRow}>
        {COLORS.map((color, index) => (
          <Pressable
            key={color}
            onPress={() => setStrokeColor(color)}
            style={[
              styles.colorDot,
              { backgroundColor: color },
              strokeColor === color && styles.colorDotSelected,
              index > 0 && styles.colorDotSpacing
            ]}
          />
        ))}
      </View>

      <View style={styles.canvasWrapper}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.canvasContainer} collapsable={false}>
            <Svg 
              width={CANVAS_WIDTH} 
              height={CANVAS_HEIGHT} 
              style={styles.svg}
              pointerEvents="none"
            >
              {value.map((stroke, index) => (
                <Path
                  key={`stroke-${index}`}
                  d={pathFromStroke(stroke)}
                  stroke={stroke.color || STROKE_COLOR}
                  strokeWidth={stroke.width || STROKE_WIDTH}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentStroke && (
                <Path
                  key="current-stroke"
                  d={pathFromStroke(currentStroke)}
                  stroke={currentStroke.color || STROKE_COLOR}
                  strokeWidth={currentStroke.width || STROKE_WIDTH}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </View>
        </GestureDetector>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, value.length === 0 && styles.controlButtonDisabled]}
          onPress={handleUndo}
          disabled={value.length === 0}
        >
          <MaterialCommunityIcons name="undo" size={20} color={value.length === 0 ? '#666' : '#FFD700'} />
          <Text style={[styles.controlButtonText, value.length === 0 && styles.controlButtonTextDisabled]}>
            Undo
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, value.length === 0 && styles.controlButtonDisabled]}
          onPress={handleClear}
          disabled={value.length === 0}
        >
          <MaterialCommunityIcons name="delete-outline" size={20} color={value.length === 0 ? '#666' : '#FFD700'} />
          <Text style={[styles.controlButtonText, value.length === 0 && styles.controlButtonTextDisabled]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  label: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    textAlign: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  colorDotSpacing: {
    marginLeft: 12,
  },
  colorDotSelected: {
    borderWidth: 2,
    borderColor: '#E6C36A',
    transform: [{ scale: 1.1 }],
  },
  canvasWrapper: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    marginBottom: 16,
  },
  canvasContainer: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    overflow: 'hidden',
    position: 'relative',
  },
  svg: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlButtonText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    color: '#FFD700',
  },
  controlButtonTextDisabled: {
    color: '#666',
  },
})


import  { useState, useRef, useMemo, useCallback } from 'react'
import { View,  TouchableOpacity, Text, Pressable } from 'react-native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import { runOnJS } from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { Stroke, DrawingCanvasProps } from '@/types/journal/journal'
import { drawingCanvasStyles } from '@/styles/journal/journal-styles'



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
    <View style={drawingCanvasStyles.container}>
      <Text style={drawingCanvasStyles.label}>Draw your reflection here</Text>
      
      {/* Color Palette */}
      <View style={drawingCanvasStyles.colorRow}>
        {COLORS.map((color, index) => (
          <Pressable
            key={color}
            onPress={() => setStrokeColor(color)}
            style={[
              drawingCanvasStyles.colorDot,
              { backgroundColor: color },
              strokeColor === color && drawingCanvasStyles.colorDotSelected,
              index > 0 && drawingCanvasStyles.colorDotSpacing
            ]}
          />
        ))}
      </View>

      <View style={drawingCanvasStyles.canvasWrapper}>
        <GestureDetector gesture={panGesture}>
          <View style={drawingCanvasStyles.canvasContainer} collapsable={false}>
            <Svg 
              width={drawingCanvasStyles.canvasWrapper.width} 
              height={drawingCanvasStyles.canvasWrapper.height} 
              style={drawingCanvasStyles.svg}
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
      
      <View style={drawingCanvasStyles.controls}>
        <TouchableOpacity
          style={[drawingCanvasStyles.controlButton, value.length === 0 && drawingCanvasStyles.controlButtonDisabled]}
          onPress={handleUndo}
          disabled={value.length === 0}
        >
          <MaterialDesignIcons name="undo" size={20} color={value.length === 0 ? '#666' : '#FFD700'} />
          <Text style={[drawingCanvasStyles.controlButtonText, value.length === 0 && drawingCanvasStyles.controlButtonTextDisabled]}>
            Undo
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[drawingCanvasStyles.controlButton, value.length === 0 && drawingCanvasStyles.controlButtonDisabled]}
          onPress={handleClear}
          disabled={value.length === 0}
        >
          <MaterialDesignIcons name="delete-outline" size={20} color={value.length === 0 ? '#666' : '#FFD700'} />
          <Text style={[drawingCanvasStyles.controlButtonText, value.length === 0 && drawingCanvasStyles.controlButtonTextDisabled]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}


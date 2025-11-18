import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { useTheme } from '../../context/ThemeContext';
import { createGlobalStyles } from '../../styles/globalStyles';

const { width, height } = Dimensions.get('window');
const isMobile = width < 600;

type Point = {
  x: number;
  y: number;
};

type Stroke = {
  points: Point[];
  color: string;
  width: number;
  imageData?: string;
};

type DrawingCanvasProps = {
  onSave: (paths: Stroke[]) => void;
  onCancel: () => void;
  hideButtons?: boolean;
  onStrokesChange?: (paths: Stroke[]) => void;
  onDrawingStart?: () => void;
  onDrawingEnd?: () => void;
};

const DrawingCanvas = React.forwardRef<{ getStrokes: () => Stroke[] }, DrawingCanvasProps>(
  ({ onSave, onCancel, hideButtons = false, onStrokesChange, onDrawingStart, onDrawingEnd }, ref) => {
    const { theme } = useTheme();
    const globalStyles = createGlobalStyles(theme);
    const signatureRef = useRef<any>(null);

    const [selectedColor, setSelectedColor] = useState('#4ee6e6');
    const [selectedWidth, setSelectedWidth] = useState(3);
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 300, height: 200 });
    const [dataURL, setDataURL] = useState<string>('');

    // Store strokes for the imperative handle
    const strokesRef = useRef<Stroke[]>([]);

    React.useImperativeHandle(ref, () => ({
      getStrokes: () => strokesRef.current
    }));

    const colors = ['#4ee6e6', '#ffe066', '#ff6b6b', '#ffffff'];
    const widths = [2, 3, 5, 8];

    const handleUndo = () => {
      signatureRef.current?.undo();
    };

    const handleClear = () => {
      signatureRef.current?.clearSignature();
      strokesRef.current = [];
      setDataURL('');
      onStrokesChange?.([]);
    };

    const handleEnd = () => {
      signatureRef.current?.readSignature();
    };

    const handleOK = (signature: string) => {
      setDataURL(signature);
      // Store the base64 image data in a special format
      // We'll include the signature data URL so it can be saved and displayed later
      const newStroke: Stroke = {
        points: [{ x: 0, y: 0 }], // Dummy point to indicate drawing exists
        color: selectedColor,
        width: selectedWidth,
        imageData: signature // Store the actual base64 image data
      };
      strokesRef.current = [newStroke];
      onStrokesChange?.(strokesRef.current);
    };

    const handleSave = () => {
      onSave(strokesRef.current);
    };

    // Change pen color by injecting JavaScript
    const changePenColor = (color: string) => {
      setSelectedColor(color);
      signatureRef.current?.changePenColor(color);
    };

    // Change pen size by injecting JavaScript
    const changePenSize = (minWidth: number, maxWidth: number) => {
      setSelectedWidth(minWidth);
      signatureRef.current?.changePenSize(minWidth, maxWidth);
    };

    const bgColor = theme.archiveMode === 'dark' ? '#0F172A' : '#FFFFFF';

    const webStyle = `
      .m-signature-pad {
        box-shadow: none;
        border: none;
        margin: 0;
      }
      .m-signature-pad--body {
        border: none;
      }
      .m-signature-pad--body canvas {
        border-radius: 0;
      }
      body,html {
        background-color: ${bgColor};
        margin: 0;
        padding: 0;
      }
    `;

    return (
      <View
        style={[
          { flex: 1, flexDirection: 'column' },
          hideButtons && { gap: 8 }
        ]}
      >
        <View
          style={[
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
          ]}
        >
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
                onPress={() => changePenColor(color)}
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
                onPress={() => changePenSize(w * 0.5, w)}
              />
            ))}
          </View>
          <View style={[globalStyles.drawingCanvasActions, { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }]}>
            <TouchableOpacity style={globalStyles.drawingCanvasActionButton} onPress={handleUndo}>
              <Ionicons name="arrow-undo" size={isMobile ? 32 : 24} color={theme.archiveText} />
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.drawingCanvasActionButton} onPress={handleClear}>
              <Ionicons name="trash" size={isMobile ? 32 : 24} color={theme.archiveText} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: bgColor,
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
          onStartShouldSetResponderCapture={() => {
            onDrawingStart?.();
            return false; // Don't capture, let canvas handle it
          }}
          onResponderRelease={() => {
            onDrawingEnd?.();
          }}
        >
          <SignatureCanvas
            ref={signatureRef}
            onEnd={() => {
              handleEnd();
              onDrawingEnd?.();
            }}
            onOK={handleOK}
            onBegin={() => {
              onDrawingStart?.();
            }}
            descriptionText=""
            clearText="Clear"
            confirmText="Save"
            webStyle={webStyle}
            autoClear={false}
            imageType="image/png"
            penColor={selectedColor}
            minWidth={selectedWidth * 0.5}
            maxWidth={selectedWidth}
            backgroundColor={bgColor}
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
            }}
          />
        </View>

        {!hideButtons && (
          <View style={isMobile ? globalStyles.drawingCanvasBottomBarMobile : globalStyles.drawingCanvasBottomBar}>
            <TouchableOpacity style={globalStyles.drawingCanvasCancelButton} onPress={onCancel}>
              <Text style={globalStyles.drawingCanvasButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.drawingCanvasSaveButton}
              onPress={handleSave}
            >
              <Text style={globalStyles.drawingCanvasButtonText}>Save Drawing</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
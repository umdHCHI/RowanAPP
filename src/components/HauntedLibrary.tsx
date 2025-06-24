import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export const HauntedLibraryBG: React.FC = () => (
  <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
    <Defs>
      <LinearGradient id="gradSky" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#1f1b38" />
        <Stop offset="100%" stopColor="#0f172a" />
      </LinearGradient>
      <LinearGradient id="gradMist" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
        <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </LinearGradient>
    </Defs>
    {/* Atmosphere */}
    <Rect width={width} height={height} fill="url(#gradSky)" />
    {[...Array(3)].map((_, i) => {
      const x = width * (0.2 + i * 0.3);
      return (
        <Path
          key={i}
          d={`M${x},${height * 0.2} v${height * 0.4} a${width*0.1},${height*0.2} 0 0,1 ${width*0.2},0 v${-height*0.4} z`}
          fill="rgba(20,15,30,0.6)"
        />
      );
    })}
    {[...Array(4)].map((_, idx) => (
      <Ellipse
        key={idx}
        cx={width * (0.5 + Math.sin(idx * 1.5) * 0.2)}
        cy={height * (0.6 - idx * 0.05)}
        rx={width * (0.7 - idx * 0.1)}
        ry={height * 0.1}
        fill="url(#gradMist)"
      />
    ))}
    {[...Array(5)].map((_, j) => (
      <Rect
        key={j}
        x={width * (0.1 + j * 0.15)}
        y={height * 0.85}
        width={width * 0.1}
        height={height * (0.08 + (j % 2) * 0.02)}
        fill="rgba(60,50,70,0.8)"
        transform={`rotate(-5, ${width*(0.1 + j*0.15 + 0.05)}, ${height*0.85 + height*(0.04 + (j %2)*0.01)})`}
      />
    ))}
  </Svg>
);
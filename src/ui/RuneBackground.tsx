import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';

const AnimatedView = Animated.createAnimatedComponent(View);

interface RuneBackgroundProps {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  reducedMotion?: boolean;
}

export const RuneBackground: React.FC<RuneBackgroundProps> = ({
  palette,
  reducedMotion = false,
}) => {
  const rotation = useSharedValue(0);
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);

  useEffect(() => {
    if (!reducedMotion) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 60000, easing: Easing.linear }),
        -1,
        false
      );

      float1.value = withRepeat(
        withTiming(20, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );

      float2.value = withRepeat(
        withTiming(15, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );

      float3.value = withRepeat(
        withTiming(18, { duration: 4500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }
  }, [reducedMotion]);

  const runeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    opacity: 0.12,
  }));

  const particle1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: float1.value }],
    opacity: 0.25,
  }));

  const particle2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: float2.value }],
    opacity: 0.2,
  }));

  const particle3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: float3.value }],
    opacity: 0.18,
  }));

  if (reducedMotion) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none" accessible={false}>
      {/* Rotating rune sigil */}
      <AnimatedView style={[styles.runeContainer, runeStyle]}>
        <Svg width="120" height="120" viewBox="0 0 120 120">
          {/* Outer circle */}
          <Circle
            cx="60"
            cy="60"
            r="50"
            stroke={palette.primary}
            strokeWidth="1"
            fill="none"
          />

          {/* Inner geometric pattern */}
          <Polygon
            points="60,20 80,50 70,80 50,80 40,50"
            stroke={palette.accent}
            strokeWidth="1"
            fill="none"
          />

          {/* Central sigil */}
          <Path
            d="M 60 35 L 60 85 M 45 60 L 75 60 M 50 45 L 70 75 M 70 45 L 50 75"
            stroke={palette.secondary}
            strokeWidth="1"
            fill="none"
          />
        </Svg>
      </AnimatedView>

      {/* Floating particles */}
      <AnimatedView style={[styles.particle, styles.particle1, particle1Style]}>
        <Svg width="8" height="8" viewBox="0 0 8 8">
          <Circle cx="4" cy="4" r="3" fill={palette.primary} opacity="0.8" />
        </Svg>
      </AnimatedView>

      <AnimatedView style={[styles.particle, styles.particle2, particle2Style]}>
        <Svg width="6" height="6" viewBox="0 0 6 6">
          <Circle cx="3" cy="3" r="2" fill={palette.accent} opacity="0.7" />
        </Svg>
      </AnimatedView>

      <AnimatedView style={[styles.particle, styles.particle3, particle3Style]}>
        <Svg width="7" height="7" viewBox="0 0 7 7">
          <Circle cx="3.5" cy="3.5" r="2.5" fill={palette.secondary} opacity="0.6" />
        </Svg>
      </AnimatedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  runeContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -60,
    marginTop: -60,
  },
  particle: {
    position: 'absolute',
  },
  particle1: {
    top: '20%',
    left: '15%',
  },
  particle2: {
    top: '60%',
    right: '20%',
  },
  particle3: {
    top: '40%',
    left: '70%',
  },
});

export default RuneBackground;

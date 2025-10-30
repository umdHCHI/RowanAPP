import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface RunicThreadBarProps {
  value: number;
  max: number;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  reducedMotion?: boolean;
}

export const RunicThreadBar: React.FC<RunicThreadBarProps> = ({
  value,
  max,
  palette,
  reducedMotion = false,
}) => {
  const progress = useSharedValue(0);
  const sparkOffset = useSharedValue(0);
  const glowPulse = useSharedValue(0.6);

  useEffect(() => {
    const targetProgress = Math.min(value / max, 1);
    progress.value = withTiming(targetProgress, {
      duration: reducedMotion ? 0 : 800,
      easing: Easing.out(Easing.cubic),
    });

    if (!reducedMotion) {
      sparkOffset.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );

      glowPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    }
  }, [value, max, reducedMotion]);

  const animatedProps = useAnimatedProps(() => {
    const pathLength = 280;
    const visibleLength = pathLength * progress.value;
    const dashOffset = pathLength - visibleLength;

    return {
      strokeDashoffset: dashOffset,
      opacity: glowPulse.value,
    };
  });

  // Braided path - more organic than a straight line
  const braidPath =
    'M 10 15 Q 40 10, 70 15 T 130 15 T 190 15 T 250 15 T 290 15';

  return (
    <View style={styles.container}>
      <Svg width="100%" height="20" viewBox="0 0 300 30" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="threadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={palette.primary} stopOpacity="0.5" />
            <Stop offset="50%" stopColor={palette.accent} stopOpacity="1" />
            <Stop offset="100%" stopColor={palette.secondary} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>

        {/* Base dimmed path */}
        <Path
          d={braidPath}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Glowing progress path */}
        <AnimatedPath
          d={braidPath}
          stroke="url(#threadGradient)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="280"
          animatedProps={animatedProps}
        />

        {/* Accent glow overlay */}
        <AnimatedPath
          d={braidPath}
          stroke={palette.primary}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="280"
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
  },
});

export default RunicThreadBar;

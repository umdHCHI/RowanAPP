import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Path, Rect, Mask, Circle } from 'react-native-svg';

const AnimatedView = Animated.createAnimatedComponent(View);

interface EchoesMeterProps {
  variant: 'lantern' | 'tether' | 'weave' | 'lens';
  value: number;
  max: number;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  reducedMotion?: boolean;
}

const LanternFill: React.FC<{ progress: number; palette: any }> = ({ progress, palette }) => {
  return (
    <Svg width="100%" height="12" viewBox="0 0 100 12">
      <Defs>
        <LinearGradient id="lanternGlow" x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor={palette.primary} stopOpacity="0.9" />
          <Stop offset="100%" stopColor={palette.accent} stopOpacity="0.4" />
        </LinearGradient>
        <LinearGradient id="lanternBg" x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.08)" stopOpacity="1" />
          <Stop offset="100%" stopColor="rgba(255,255,255,0.03)" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Background Container - matches fill pattern */}
      <Rect x="0" y="0" width="100" height="12" fill="url(#lanternBg)" rx="6" />
      <Rect x="0" y="0" width="100" height="12" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" rx="6" />

      {/* Fill from bottom */}
      <Rect
        x="0"
        y={12 - (12 * progress)}
        width="100"
        height={12 * progress}
        fill="url(#lanternGlow)"
        rx="6"
      />

      {/* Glow accent at top of fill */}
      {progress > 0 && (
        <Rect
          x="0"
          y={Math.max(0, 12 - (12 * progress) - 2)}
          width="100"
          height="2"
          fill={palette.primary}
          opacity="0.8"
          rx="1"
        />
      )}
    </Svg>
  );
};

const TetherLine: React.FC<{ progress: number; palette: any }> = ({ progress, palette }) => {
  const tension = 15 - (progress * 10); // Line straightens as it fills

  return (
    <Svg width="100%" height="14" viewBox="0 0 100 14">
      <Defs>
        <LinearGradient id="tetherGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={palette.primary} stopOpacity="0.3" />
          <Stop offset={`${progress * 100}%`} stopColor={palette.accent} stopOpacity="0.95" />
          <Stop offset="100%" stopColor={palette.secondary} stopOpacity="0.2" />
        </LinearGradient>
      </Defs>

      {/* Background rope - full length visible */}
      <Path
        d={`M 0 ${7 + tension} Q 25 ${7 - tension}, 50 ${7 + tension} T 100 ${7 + tension}`}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Active tether - fills along the rope */}
      <Path
        d={`M 0 ${7 + tension} Q 25 ${7 - tension}, 50 ${7 + tension} T 100 ${7 + tension}`}
        stroke="url(#tetherGradient)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${progress * 100} ${100 - (progress * 100)}`}
      />
    </Svg>
  );
};

const WeaveThreads: React.FC<{ progress: number; palette: any }> = ({ progress, palette }) => {
  return (
    <Svg width="100%" height="12" viewBox="0 0 100 12">
      <Defs>
        <LinearGradient id="weaveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={palette.primary} stopOpacity="0.5" />
          <Stop offset="100%" stopColor={palette.accent} stopOpacity="0.9" />
        </LinearGradient>
        <LinearGradient id="weaveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={palette.secondary} stopOpacity="0.4" />
          <Stop offset="100%" stopColor={palette.primary} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>

      {/* Background threads - dim, full length */}
      <Path
        d="M 0 3 Q 16.6 1, 33.3 3 T 66.6 3 T 100 3"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 0 9 Q 16.6 11, 33.3 9 T 66.6 9 T 100 9"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 0 6 L 100 6"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Active Thread 1 - weaves over */}
      <Path
        d="M 0 3 Q 16.6 1, 33.3 3 T 66.6 3 T 100 3"
        stroke="url(#weaveGrad1)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${progress * 100} ${100 - (progress * 100)}`}
      />

      {/* Active Thread 2 - weaves under */}
      <Path
        d="M 0 9 Q 16.6 11, 33.3 9 T 66.6 9 T 100 9"
        stroke="url(#weaveGrad2)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${progress * 100} ${100 - (progress * 100)}`}
      />

      {/* Active Thread 3 - center stabilizer */}
      <Path
        d="M 0 6 L 100 6"
        stroke={palette.accent}
        strokeWidth="2"
        fill="none"
        opacity="0.6"
        strokeDasharray={`${progress * 100} ${100 - (progress * 100)}`}
      />
    </Svg>
  );
};

const LensReveal: React.FC<{ progress: number; palette: any }> = ({ progress, palette }) => {
  return (
    <Svg width="100%" height="12" viewBox="0 0 100 12">
      <Defs>
        <LinearGradient id="lensGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={palette.primary} stopOpacity="0.3" />
          <Stop offset={`${progress * 100}%`} stopColor={palette.accent} stopOpacity="1" />
          <Stop offset="100%" stopColor="rgba(255,255,255,0.1)" stopOpacity="0.2" />
        </LinearGradient>

        <Mask id="lensMask">
          <Rect x="0" y="0" width={100 * progress} height="12" fill="white" />
        </Mask>
      </Defs>

      {/* Foggy base - always visible background */}
      <Rect x="0" y="0" width="100" height="12" fill="rgba(255,255,255,0.12)" rx="6" />
      <Rect x="0" y="0" width="100" height="12" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" rx="6" />

      {/* Clear lens effect - reveals over foggy base */}
      <Rect
        x="0"
        y="0"
        width="100"
        height="12"
        fill="url(#lensGradient)"
        mask="url(#lensMask)"
        rx="6"
      />

      {/* Sparkle at the edge of clarity */}
      {progress > 0 && progress < 1 && (
        <Circle
          cx={100 * progress}
          cy="6"
          r="3"
          fill={palette.primary}
          opacity="0.9"
        />
      )}
    </Svg>
  );
};

export const EchoesMeter: React.FC<EchoesMeterProps> = ({
  variant,
  value,
  max,
  palette,
  reducedMotion = false,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    const targetProgress = Math.min(value / max, 1);
    progress.value = withTiming(targetProgress, {
      duration: reducedMotion ? 0 : 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, max, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  const currentProgress = Math.min(value / max, 1);

  return (
    <AnimatedView style={[styles.container, animatedStyle]}>
      {variant === 'lantern' && <LanternFill progress={currentProgress} palette={palette} />}
      {variant === 'tether' && <TetherLine progress={currentProgress} palette={palette} />}
      {variant === 'weave' && <WeaveThreads progress={currentProgress} palette={palette} />}
      {variant === 'lens' && <LensReveal progress={currentProgress} palette={palette} />}
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
    height: 16,
  },
});

export default EchoesMeter;

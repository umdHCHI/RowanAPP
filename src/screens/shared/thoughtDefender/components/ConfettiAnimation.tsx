import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  delay: number;
}

interface ConfettiAnimationProps {
  visible: boolean;
  position: { x: number; y: number };
  text?: string;
  onComplete?: () => void;
}

const COLORS = ['#ff0041', '#00ff41', '#ffd700', '#4ee6e6', '#ff9d00', '#d4af37'];
const PARTICLE_COUNT = 20;

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  visible,
  position,
  text,
  onComplete,
}) => {
  const particles = React.useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: position.x + (Math.random() - 0.5) * 40,
      y: position.y + (Math.random() - 0.5) * 40,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      delay: Math.random() * 200,
    }));
  }, [position.x, position.y]);

  if (!visible) return null;

  return (
    <View style={[styles.container, { left: position.x, top: position.y }]} pointerEvents="none">
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} particle={particle} />
      ))}
      {text && <ExplodingText text={text} position={position} onComplete={onComplete} />}
    </View>
  );
};

const ConfettiParticle: React.FC<{ particle: ConfettiParticle }> = ({ particle }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(particle.rotation);
  const scale = useSharedValue(1);

  useEffect(() => {
    const angle = (Math.random() - 0.5) * Math.PI * 2;
    const distance = 60 + Math.random() * 80;
    const duration = 600 + Math.random() * 400;

    translateX.value = withDelay(
      particle.delay,
      withTiming(Math.cos(angle) * distance, {
        duration,
        easing: Easing.out(Easing.quad),
      })
    );
    translateY.value = withDelay(
      particle.delay,
      withTiming(Math.sin(angle) * distance - 50, {
        duration,
        easing: Easing.out(Easing.quad),
      })
    );
    rotation.value = withDelay(
      particle.delay,
      withTiming(particle.rotation + 360, {
        duration,
        easing: Easing.linear,
      })
    );
    opacity.value = withDelay(
      particle.delay + duration * 0.7,
      withTiming(0, {
        duration: duration * 0.3,
        easing: Easing.out(Easing.quad),
      })
    );
    scale.value = withDelay(
      particle.delay,
      withSequence(
        withTiming(1.2, { duration: duration * 0.2, easing: Easing.out(Easing.quad) }),
        withTiming(0.8, { duration: duration * 0.8, easing: Easing.in(Easing.quad) })
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: particle.color,
          left: particle.x,
          top: particle.y,
        },
        animatedStyle,
      ]}
    />
  );
};

const ExplodingText: React.FC<{
  text: string;
  position: { x: number; y: number };
  onComplete?: () => void;
}> = ({ text, position, onComplete }) => {
  const words = text.split(' ');
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.5, { duration: 200, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) })
    );
    opacity.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    });
    if (onComplete) {
      setTimeout(() => runOnJS(onComplete)(), 600);
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.textContainer,
        {
          left: position.x,
          top: position.y,
        },
        animatedStyle,
      ]}
    >
      {words.map((word, i) => {
        const wordTranslateX = useSharedValue(0);
        const wordTranslateY = useSharedValue(0);
        const wordOpacity = useSharedValue(1);

        useEffect(() => {
          const angle = (Math.random() - 0.5) * Math.PI * 2;
          const distance = 40 + Math.random() * 60;
          const delay = i * 30;

          wordTranslateX.value = withDelay(
            delay,
            withTiming(Math.cos(angle) * distance, {
              duration: 500,
              easing: Easing.out(Easing.quad),
            })
          );
          wordTranslateY.value = withDelay(
            delay,
            withTiming(Math.sin(angle) * distance - 30, {
              duration: 500,
              easing: Easing.out(Easing.quad),
            })
          );
          wordOpacity.value = withDelay(
            delay + 300,
            withTiming(0, {
              duration: 200,
              easing: Easing.out(Easing.quad),
            })
          );
        }, []);

        const wordStyle = useAnimatedStyle(() => ({
          transform: [
            { translateX: wordTranslateX.value },
            { translateY: wordTranslateY.value },
          ],
          opacity: wordOpacity.value,
        }));

        return (
          <Animated.Text key={i} style={[styles.explodingText, wordStyle]}>
            {word}
          </Animated.Text>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  explodingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginHorizontal: 2,
  },
});


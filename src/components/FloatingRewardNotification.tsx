import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

interface FloatingRewardNotificationProps {
  visible: boolean;
  message: string;
  type?: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest';
  icon?: string;
  iconImage?: any; // For PNG image assets
  statName?: string;
  onHide: () => void;
}

const FloatingRewardNotification: React.FC<FloatingRewardNotificationProps> = ({
  visible,
  message,
  type = 'stat',
  icon: customIcon,
  iconImage,
  statName,
  onHide
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.8);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 4 seconds (increased from 3 seconds)
      const timer = setTimeout(() => {
        hideNotification();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getTypeStyles = () => {
    // If it's a stat type and we have a statName, use stat-specific colors
    if (type === 'stat' && statName) {
      const statColors: Record<string, { backgroundColor: string; borderColor: string }> = {
        'awareness': { backgroundColor: '#4A90E2', borderColor: '#357ABD' },
        'exploration': { backgroundColor: '#4A90E2', borderColor: '#357ABD' },
        'resilience': { backgroundColor: '#2ECC71', borderColor: '#27AE60' },
        'courage': { backgroundColor: '#2ECC71', borderColor: '#27AE60' },
        'connection': { backgroundColor: '#E74C3C', borderColor: '#C0392B' },
        'balance': { backgroundColor: '#F39C12', borderColor: '#D68910' },
        'fear': { backgroundColor: '#F39C12', borderColor: '#D68910' }
      };
      
      const statColor = statColors[statName.toLowerCase()];
      if (statColor) {
        return {
          ...statColor,
          icon: customIcon || '✨'
        };
      }
    }
    
    switch (type) {
      case 'experience':
        return {
          backgroundColor: '#FFD700',
          borderColor: '#FFA500',
          icon: '⭐'
        };
      case 'resonance':
        return {
          backgroundColor: '#FF6B6B',
          borderColor: '#FF5252',
          icon: '🌟'
        };
      case 'item':
        return {
          backgroundColor: '#4CAF50',
          borderColor: '#45A049',
          icon: '🎁'
        };
      case 'skill':
        return {
          backgroundColor: '#2196F3',
          borderColor: '#1976D2',
          icon: '📚'
        };
      case 'artifact':
        return {
          backgroundColor: '#9C27B0',
          borderColor: '#7B1FA2',
          icon: '💎'
        };
      case 'upgrade':
        return {
          backgroundColor: '#FF9800',
          borderColor: '#F57C00',
          icon: '⬆️'
        };
      case 'strengthen':
        return {
          backgroundColor: '#795548',
          borderColor: '#5D4037',
          icon: '💪'
        };
      case 'new':
        return {
          backgroundColor: '#00BCD4',
          borderColor: '#0097A7',
          icon: '🆕'
        };
      case 'quest':
        return {
          backgroundColor: '#FF6B9D',
          borderColor: '#E91E63',
          icon: '🎯'
        };
      default:
        return {
          backgroundColor: '#A855F7',
          borderColor: '#9333EA',
          icon: '✨'
        };
    }
  };

  const typeStyles = getTypeStyles();
  
  // Use custom icon if provided, otherwise use type-based icon
  const displayIcon = customIcon || typeStyles.icon;

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <View
        style={[
          styles.notification,
          {
            backgroundColor: typeStyles.backgroundColor,
            borderColor: typeStyles.borderColor,
          }
        ]}
      >
        {iconImage ? (
          <Image 
            source={iconImage} 
            style={styles.iconImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.icon}>{displayIcon}</Text>
        )}
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 200,
    maxWidth: 300,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  iconImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  message: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
});

export default FloatingRewardNotification; 
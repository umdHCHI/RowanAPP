import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { PersonalityWellnessAttributes } from '../../imports';

interface FloatingRewardNotificationProps {
  visible: boolean;
  message: string;
  type?:  'experience' |'lumens' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest';
  icon?: string;
  iconImage?: any; // For PNG image assets
  statName?: string;
  personalityTrait?: string; // For personality-specific colors
  onHide: () => void;
}

const FloatingRewardNotification: React.FC<FloatingRewardNotificationProps> = ({
  visible,
  message,
  type = 'stat',
  icon: customIcon,
  iconImage,
  statName,
  personalityTrait,
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

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 3000);

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

  // Helper function to adjust color brightness for border
  const adjustColorBrightness = (color: string, percent: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  const getTypeStyles = () => {
    // If it's a stat type and we have a statName, use stat-specific colors
    if (type === 'stat' && statName) {
      // For personality users, try to get personality-specific colors
      if (personalityTrait) {
        const normalizedStat = statName.toLowerCase();
        const wellnessProperty = ['awareness', 'resilience', 'connection', 'balance'].includes(normalizedStat)
          ? normalizedStat
          : normalizedStat === 'exploration' ? 'awareness'
          : normalizedStat === 'courage' ? 'resilience'
          : normalizedStat === 'fear' ? 'balance'
          : normalizedStat;

        const personalityKey = personalityTrait.charAt(0).toUpperCase() + personalityTrait.slice(1).toLowerCase();
        const personalityAttributes = PersonalityWellnessAttributes[personalityKey as keyof typeof PersonalityWellnessAttributes];

        if (personalityAttributes) {
          const attribute = personalityAttributes.attributes.find(
            (attr: any) => attr.wellnessProperty === wellnessProperty
          );
          if (attribute) {
            // Use personality-specific color with a darker border
            const color = attribute.color;
            const darkerBorder = adjustColorBrightness(color, -30);
            return {
              backgroundColor: color,
              borderColor: darkerBorder,
              icon: customIcon || '✨'
            };
          }
        }
      }

      // Fallback to default colors for character users or if personality color not found
      const statColors: Record<string, { backgroundColor: string; borderColor: string }> = {
        'awareness': { backgroundColor: '#4A90E2', borderColor: '#357ABD' },
        'exploration': { backgroundColor: '#4A90E2', borderColor: '#357ABD' },
        'lumens': { backgroundColor: '#2ECC71', borderColor: '#27AE60' },
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

      case 'lumens':
        return {
          backgroundColor: '#FF6B6B',
          borderColor: '#FF5252',
          icon: '🌙',
          label: 'Lumens'
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

  if (!visible) {
    return null;
  }

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
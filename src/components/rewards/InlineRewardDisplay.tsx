import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { PersonalityWellnessAttributes } from "../../imports";

/**
 * InlineRewardDisplay - A persistent, non-intrusive reward display component
 *
 * This component displays rewards directly within the story content rather than
 * as floating overlays. It provides a more integrated user experience by showing
 * rewards contextually within the narrative flow and keeping them visible
 * throughout the story session.
 *
 * Features:
 * - Displays rewards with appropriate colors based on personality traits
 * - Shows attribute images for character users
 * - Uses personality-specific colors and icons for personality users
 * - Persists rewards throughout the story session (no auto-hide)
 * - Smooth animations for appearance
 * - Accumulates all rewards for easy tracking
 */
interface InlineRewardDisplayProps {
  visible: boolean;
  message: string;
  type?:
    | "experience"
    | "lumens"
    | "item"
    | "skill"
    | "stat"
    | "artifact"
    | "upgrade"
    | "strengthen"
    | "new"
    | "quest";
  icon?: string;
  iconImage?: any; // For PNG image assets
  statName?: string;
  personalityTrait?: string; // For personality-specific colors
  onComplete?: () => void;
}

const InlineRewardDisplay: React.FC<InlineRewardDisplayProps> = ({
  visible,
  message,
  type = "stat",
  icon: customIcon,
  iconImage,
  statName,
  personalityTrait,
  onComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      scaleAnim.setValue(0.9);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Only call onComplete after animation finishes to signal it's ready for the next reward
        onComplete?.();
      });
    }
  }, [visible]);

  // Helper function to adjust color brightness for border
  const adjustColorBrightness = (color: string, percent: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
    return (
      "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
    );
  };

  const getTypeStyles = () => {
    // If it's a stat type and we have a statName, use stat-specific colors
    if (type === "stat" && statName) {
      // For personality users, try to get personality-specific colors
      if (personalityTrait) {
        const normalizedStat = statName.toLowerCase();
        const wellnessProperty = [
          "awareness",
          "resilience",
          "connection",
          "balance",
        ].includes(normalizedStat)
          ? normalizedStat
          : normalizedStat === "exploration"
          ? "awareness"
          : normalizedStat === "courage"
          ? "resilience"
          : normalizedStat === "fear"
          ? "balance"
          : normalizedStat;

        const personalityKey =
          personalityTrait.charAt(0).toUpperCase() +
          personalityTrait.slice(1).toLowerCase();
        const personalityAttributes =
          PersonalityWellnessAttributes[
            personalityKey as keyof typeof PersonalityWellnessAttributes
          ];

        if (personalityAttributes) {
          const attribute = personalityAttributes.attributes.find(
            (attr: any) => attr.wellnessProperty === wellnessProperty
          );
          if (attribute) {
            // Use personality-specific color with a darker border
            const color = attribute.color;
            const darkerBorder = adjustColorBrightness(color, -30);
            return {
              backgroundColor: `${color}20`, // 20 = 12.5% opacity
              borderColor: color,
              textColor: color,
              icon: customIcon || "✨",
            };
          }
        }
      }

      // Fallback to default colors for character users or if personality color not found
      const statColors: Record<
        string,
        { backgroundColor: string; borderColor: string; textColor: string }
      > = {
        awareness: {
          backgroundColor: "#4A90E220",
          borderColor: "#4A90E2",
          textColor: "#4A90E2",
        },
        exploration: {
          backgroundColor: "#4A90E220",
          borderColor: "#4A90E2",
          textColor: "#4A90E2",
        },
        resilience: {
          backgroundColor: "#2ECC7120",
          borderColor: "#2ECC71",
          textColor: "#2ECC71",
        },
        courage: {
          backgroundColor: "#2ECC7120",
          borderColor: "#2ECC71",
          textColor: "#2ECC71",
        },
        connection: {
          backgroundColor: "#E74C3C20",
          borderColor: "#E74C3C",
          textColor: "#E74C3C",
        },
        balance: {
          backgroundColor: "#F39C1220",
          borderColor: "#F39C12",
          textColor: "#F39C12",
        },
        fear: {
          backgroundColor: "#F39C1220",
          borderColor: "#F39C12",
          textColor: "#F39C12",
        },
      };

      const statColor = statColors[statName.toLowerCase()];
      if (statColor) {
        return {
          ...statColor,
          icon: customIcon || "✨",
        };
      }
    }

    // Default colors for other reward types
    const typeColors: Record<
      string,
      { backgroundColor: string; borderColor: string; textColor: string }
    > = {
      experience: {
        backgroundColor: "#FFD70020",
        borderColor: "#FFD700",
        textColor: "#FFD700",
      },
      lumens: {
        backgroundColor: "#FFD70020",
        borderColor: "#FFD700",
        textColor: "#FFD700",
      },
      item: {
        backgroundColor: "#9B59B620",
        borderColor: "#9B59B6",
        textColor: "#9B59B6",
      },
      skill: {
        backgroundColor: "#3498DB20",
        borderColor: "#3498DB",
        textColor: "#3498DB",
      },
      artifact: {
        backgroundColor: "#E67E2220",
        borderColor: "#E67E22",
        textColor: "#E67E22",
      },
      quest: {
        backgroundColor: "#16A08520",
        borderColor: "#16A085",
        textColor: "#16A085",
      },
      upgrade: {
        backgroundColor: "#F39C1220",
        borderColor: "#F39C12",
        textColor: "#F39C12",
      },
      strengthen: {
        backgroundColor: "#2ECC7120",
        borderColor: "#2ECC71",
        textColor: "#2ECC71",
      },
      new: {
        backgroundColor: "#9B59B620",
        borderColor: "#9B59B6",
        textColor: "#9B59B6",
      },
    };

    return typeColors[type] || typeColors["experience"];
  };

  const renderIcon = () => {
    if (iconImage) {
      return (
        <Image
          source={iconImage}
          style={styles.iconImage}
          resizeMode="contain"
        />
      );
    }

    const typeStyles = getTypeStyles();
    const iconText = customIcon || "✨";

    return (
      <Text style={[styles.iconText, { color: typeStyles.textColor }]}>
        {iconText}
      </Text>
    );
  };

  if (!visible) return null;

  const typeStyles = getTypeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          backgroundColor: typeStyles.backgroundColor,
          borderColor: typeStyles.borderColor,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>{renderIcon()}</View>
        <Text style={[styles.message, { color: typeStyles.textColor }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 12,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    width: 28,
    height: 28,
  },
  iconText: {
    fontSize: 20,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default InlineRewardDisplay;

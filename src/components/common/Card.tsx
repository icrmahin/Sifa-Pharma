/* eslint-disable react-hooks/immutability -- Reanimated shared values are mutable by design */
import { Pressable, StyleSheet, type ViewProps } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, useReducedMotion } from "react-native-reanimated";
import { border as borderToken, surface } from "../../constants/colors";
import { radius } from "../../constants/sizes";
import { spacing } from "../../constants/spacing";
import { shadows } from "../../constants/shadows";
import { springConfigs, compression as compressionValues } from "../../lib/motion";

type CardProps = ViewProps & {
  /** Make the card pressable */
  onPress?: () => void;
  /** Show a pressed visual state */
  pressed?: boolean;
  /** Card elevation. Default: "sm" */
  elevation?: "none" | "xs" | "sm" | "md";
};

/**
 * Surface container for grouping related content.
 * Optional onPress wraps the card in a Pressable with animated spring compression.
 */
export default function Card({
  onPress,
  pressed = false,
  elevation = "sm",
  style,
  children,
  ...props
}: CardProps) {
  const shadowStyle = shadows[elevation];
  const reducedMotion = useReducedMotion();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (reducedMotion) return;
    scale.value = withSpring(compressionValues.subtle, springConfigs.card);
    opacity.value = withSpring(0.92, springConfigs.card);
  };

  const handlePressOut = () => {
    if (reducedMotion) return;
    scale.value = withSpring(1, springConfigs.card);
    opacity.value = withSpring(1, springConfigs.card);
  };

  const cardStyles = [
    styles.card,
    shadowStyle,
    pressed && styles.pressed,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[cardStyles, animatedStyle]} {...props}>
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Animated.View style={[cardStyles, animatedStyle]} {...props}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface.DEFAULT,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: borderToken.light,
  },
  pressed: {
    opacity: 0.92,
  },
});

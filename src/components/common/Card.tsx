import { Pressable, StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";
import { colors, surface, border as borderToken } from "../../constants/colors";
import { radius } from "../../constants/sizes";
import { spacing } from "../../constants/spacing";
import { shadows } from "../../constants/shadows";

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
 * Optional onPress wraps the card in a Pressable with pressed feedback.
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

  const content = (
    <View
      style={[
        styles.card,
        shadowStyle,
        pressed && styles.pressed,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed: p }) => [
          styles.card,
          shadowStyle,
          p && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return content;
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
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});

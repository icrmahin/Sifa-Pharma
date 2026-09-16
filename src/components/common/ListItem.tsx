/* eslint-disable react-hooks/immutability -- Reanimated shared values are mutable by design */
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { SymbolView } from "expo-symbols";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, useReducedMotion } from "react-native-reanimated";
import { colors, border as borderToken } from "../../constants/colors";
import { layout } from "../../constants/sizes";
import { spacing } from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";
import { springConfigs } from "../../lib/motion";

type ListItemProps = {
  /** Primary text */
  title: string;
  /** Secondary text below the title */
  subtitle?: string;
  /** Left element (icon, avatar, badge) */
  left?: React.ReactNode;
  /** Right element (chevron, badge, action) */
  right?: React.ReactNode;
  /** Press handler. If provided, renders as Pressable */
  onPress?: () => void;
  /** Show divider line above this item */
  divider?: boolean;
  /** Compact mode with less padding */
  compact?: boolean;
  style?: ViewStyle;
};

/**
 * Single row for lists, settings screens, and menu items.
 * Supports leading/trailing elements and optional animated press feedback.
 */
export default function ListItem({
  title,
  subtitle,
  left,
  right,
  onPress,
  divider = false,
  compact = false,
  style,
}: ListItemProps) {
  const reducedMotion = useReducedMotion();

  const padding = compact
    ? { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }
    : { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (reducedMotion) return;
    scale.value = withSpring(0.98, springConfigs.snap);
  };

  const handlePressOut = () => {
    if (reducedMotion) return;
    scale.value = withSpring(1, springConfigs.snap);
  };

  const content = (
    <View style={[styles.row, padding, divider && styles.divider, style]}>
      {left ? <View style={styles.left}>{left}</View> : null}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? (
        <View style={styles.right}>{right}</View>
      ) : onPress ? (
        <SymbolView
          name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
          tintColor={colors.textMuted}
          size={16}
        />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={animatedStyle}>
          {content}
        </Animated.View>
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: layout.touch,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: borderToken.light,
  },
  left: { flexShrink: 0 },
  content: { flex: 1, gap: 2 },
  right: { flexShrink: 0 },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body,
    lineHeight: fontSize.body * lineHeight.normal,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * lineHeight.normal,
    color: colors.textMuted,
  },
});

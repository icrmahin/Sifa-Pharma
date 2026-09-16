import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, surface } from "../../constants/colors";
import { radius } from "../../constants/sizes";
import { spacing } from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  /** Show as a small dot instead of a pill */
  dot?: boolean;
  style?: ViewStyle;
};

const palette: Record<BadgeVariant, { bg: string; fg: string }> = {
  primary:  { bg: colors.primarySoft, fg: colors.primary },
  success:  { bg: colors.successSoft, fg: colors.success },
  warning:  { bg: colors.warningSoft, fg: colors.warning },
  danger:   { bg: colors.dangerSoft, fg: colors.danger },
  info:     { bg: colors.infoSoft, fg: colors.info },
  neutral:  { bg: surface.disabled, fg: colors.textMuted },
};

/**
 * Compact pill badge for status indicators and labels.
 */
export default function Badge({ label, variant = "neutral", dot = false, style }: BadgeProps) {
  const p = palette[variant];

  if (dot) {
    return (
      <View
        style={[styles.dot, { backgroundColor: p.fg }, style]}
        accessibilityLabel={label}
        accessibilityRole="text"
      />
    );
  }

  return (
    <View
      style={[styles.badge, { backgroundColor: p.bg }, style]}
      accessibilityLabel={label}
      accessibilityRole="text"
    >
      <Text style={[styles.text, { color: p.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.micro,
    lineHeight: fontSize.micro * lineHeight.tight,
    letterSpacing: 0.4,
  },
});

import { Pressable, StyleSheet, Text } from "react-native";
import { colors, surface } from "../../constants/colors";
import { radius } from "../../constants/sizes";
import { spacing } from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Visual variant. Default: "filter" */
  variant?: "filter" | "assist" | "input";
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Show remove "x" button */
  onRemove?: () => void;
};

/**
 * Compact chip for filters, selectable tags, and inline actions.
 */
export default function Chip({
  label,
  selected = false,
  onPress,
  variant = "filter",
  icon,
  onRemove,
}: ChipProps) {
  const isFilter = variant === "filter";

  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, isFilter && styles.filter, selected && styles.selected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      {icon}
      <Text style={[styles.text, selected && styles.selectedText]} numberOfLines={1}>
        {label}
      </Text>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          style={styles.removeBtn}
        >
          <Text style={[styles.removeText, selected && styles.selectedText]}>×</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    minHeight: 36,
    backgroundColor: surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filter: {
    backgroundColor: surface.DEFAULT,
  },
  selected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  text: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * lineHeight.normal,
    color: colors.text,
  },
  selectedText: { color: colors.primary },
  removeBtn: { marginLeft: spacing.xxs },
  removeText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    lineHeight: fontSize.body * lineHeight.tight,
    color: colors.textMuted,
  },
});

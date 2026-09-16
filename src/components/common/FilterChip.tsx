import { Pressable, StyleSheet, Text } from "react-native";
import { colors, surface } from "../../constants/colors";
import { radius } from "../../constants/sizes";
import { spacing } from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";

type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

/**
 * Filter chip — prefer using Chip component for new code.
 * Kept for backward compatibility.
 */
export default function FilterChip({ label, selected = false, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Filter by ${label}`}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: surface.DEFAULT,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
    justifyContent: "center",
  },
  selected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  text: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * lineHeight.normal,
    color: colors.text,
  },
  selectedText: { color: colors.primary },
});

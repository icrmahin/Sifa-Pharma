import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, surface } from "../../constants/colors";
import { radius, layout, opacity as opacityToken } from "../../constants/sizes";
import { spacing } from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";
import { shadows } from "../../constants/shadows";
import Icon from "./Icon";

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  value?: string;
  options: Option[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  onSelect: (value: string) => void;
  style?: ViewStyle;
};

export default function Select({
  label,
  value,
  options,
  placeholder = "Select…",
  error,
  disabled = false,
  onSelect,
  style,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.trigger,
          !!error && styles.triggerError,
          disabled && styles.triggerDisabled,
          pressed && !disabled && { opacity: opacityToken.pressed },
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        accessibilityLabel={label || placeholder}
      >
        <Text
          style={[styles.triggerText, !selected && styles.placeholder]}
          numberOfLines={1}
        >
          {selected?.label || placeholder}
        </Text>
        <Icon name="expand-more" size={18} color={colors.textMuted} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label || placeholder}</Text>
            {options.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => {
                  onSelect(opt.value);
                  setOpen(false);
                }}
                style={[styles.option, opt.value === value && styles.optionSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected: opt.value === value }}
              >
                <Text style={[styles.optionText, opt.value === value && styles.optionTextSelected]}>
                  {opt.label}
                </Text>
                {opt.value === value && (
                  <Icon name="check" size={18} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.bodySmall,
    lineHeight: fontSize.bodySmall * lineHeight.normal,
    color: colors.text,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: layout.inputHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: surface.DEFAULT,
    paddingHorizontal: spacing.lg,
  },
  triggerError: { borderColor: colors.danger },
  triggerDisabled: { opacity: opacityToken.disabled, backgroundColor: surface.disabled },
  triggerText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: fontSize.body * lineHeight.normal,
    color: colors.text,
  },
  placeholder: { color: colors.textMuted },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    lineHeight: fontSize.caption * lineHeight.normal,
    color: colors.danger,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: spacing.xl,
  },
  sheet: {
    backgroundColor: surface.DEFAULT,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  sheetTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.callout,
    lineHeight: fontSize.callout * lineHeight.normal,
    color: colors.text,
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    minHeight: layout.touch,
  },
  optionSelected: { backgroundColor: colors.primarySoft },
  optionText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: fontSize.body * lineHeight.normal,
    color: colors.text,
  },
  optionTextSelected: { color: colors.primary, fontFamily: fontFamily.semiBold },
});

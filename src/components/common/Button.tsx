import { Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from "react-native";
import { colors, surface } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";
import { radius, layout, opacity as opacityToken } from "../../constants/sizes";
import { shadows } from "../../constants/shadows";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "link";

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  /** Render an icon before the title */
  icon?: React.ReactNode;
  style?: ViewStyle;
};

const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string; ripple: string }> = {
  primary:   { bg: colors.primary,   fg: colors.white, ripple: "rgba(255,255,255,0.22)" },
  secondary: { bg: surface.DEFAULT, fg: colors.primary, border: colors.border, ripple: colors.ripple.primary },
  danger:    { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerBorder, ripple: colors.ripple.danger },
  ghost:     { bg: colors.primarySoft, fg: colors.primary, ripple: colors.ripple.primary },
  link:      { bg: "transparent",   fg: colors.primary, ripple: colors.ripple.primary },
};

export default function Button({
  title,
  variant = "primary",
  fullWidth = false,
  loading = false,
  disabled,
  icon,
  style,
  ...props
}: ButtonProps) {
  const p = palette[variant];

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      android_ripple={{ color: p.ripple, borderless: false }}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: p.bg },
        p.border && { borderWidth: 1, borderColor: p.border },
        variant === "link" && styles.link,
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <Text style={[styles.label, { color: p.fg }]}>Please wait…</Text>
      ) : (
        <Text style={[styles.label, { color: p.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.buttonHeight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    ...shadows.xs,
  },
  fullWidth: { width: "100%" },
  pressed: { opacity: opacityToken.pressed, transform: [{ scale: 0.98 }] },
  disabled: { opacity: opacityToken.disabled },
  link: { paddingHorizontal: 0, paddingVertical: 0, minHeight: 0, ...shadows.none },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * lineHeight.tight,
    letterSpacing: 0.2,
  },
});

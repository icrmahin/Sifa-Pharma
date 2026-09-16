import { Pressable, StyleSheet, View, type PressableProps, type ViewStyle } from "react-native";
import { colors, surface } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { radius, layout, opacity as opacityToken } from "../../constants/sizes";

type IconButtonProps = PressableProps & {
  /** The icon element to render */
  icon: React.ReactNode;
  /** Accessible label (required for icon-only buttons) */
  accessibilityLabel: string;
  /** Visual variant. Default: "ghost" */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Size of the hit target. Default: 44 */
  size?: number;
  /** Optional badge dot indicator */
  badge?: boolean;
  style?: ViewStyle;
};

export default function IconButton({
  icon,
  accessibilityLabel,
  variant = "ghost",
  size = layout.touch,
  badge = false,
  disabled,
  style,
  ...props
}: IconButtonProps) {
  const bg = {
    primary: colors.primary,
    secondary: surface.DEFAULT,
    ghost: "transparent",
    danger: colors.dangerSoft,
  }[variant];

  const ripple = {
    primary: "rgba(255,255,255,0.22)",
    secondary: colors.ripple.primary,
    ghost: colors.ripple.neutral,
    danger: colors.ripple.danger,
  }[variant];

  return (
    <Pressable
      {...props}
      disabled={disabled}
      android_ripple={{ color: ripple }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, backgroundColor: bg },
        variant === "secondary" && styles.bordered,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
      {badge && <View style={styles.badgeDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  bordered: { borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: opacityToken.pressed, transform: [{ scale: 0.95 }] },
  disabled: { opacity: opacityToken.disabled },
  badgeDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
});

import { Platform, Switch, type SwitchProps, type ViewStyle } from "react-native";
import { colors, surface } from "../../constants/colors";
import { opacity as opacityToken, layout } from "../../constants/sizes";

type ToggleProps = Omit<SwitchProps, "value" | "onValueChange" | "trackColor" | "thumbColor"> & {
  value: boolean;
  onValueChange: (value: boolean) => void;
  variant?: "primary" | "danger";
  size?: "sm" | "md";
  style?: ViewStyle;
};

/**
 * Toggle switch built on React Native's native Switch.
 * Adapts to platform conventions (iOS green, Android accent).
 */
export default function Toggle({
  value,
  onValueChange,
  variant = "primary",
  size = "md",
  disabled,
  style,
  ...props
}: ToggleProps) {
  const trackOn = variant === "danger" ? colors.danger : colors.primary;
  const trackOff = colors.border;
  const thumbOff = surface.DEFAULT;

  const isSmall = size === "sm";

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: trackOff, true: trackOn }}
      thumbColor={Platform.OS === "android" ? (value ? colors.white : thumbOff) : colors.white}
      ios_backgroundColor={trackOff}
      style={[
        { opacity: disabled ? opacityToken.disabled : 1 },
        isSmall && { transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] },
        style,
      ]}
      accessibilityRole="switch"
      accessibilityState={{ disabled, checked: value }}
      {...props}
    />
  );
}

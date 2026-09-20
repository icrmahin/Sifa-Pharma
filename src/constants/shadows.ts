// ─── Dual Shadow System ──────────────────────────────────
// Two-layer shadows for depth: ambient (diffuse) + key (directional)
import { useThemeColors } from "../providers/ThemeProvider";

export type ShadowElevation = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

// Feather-light: diffuse, low opacity, larger blur
const buildShadows = (colors: ReturnType<typeof useThemeColors>) => ({
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  xl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.09,
    shadowRadius: 32,
    elevation: 8,
  },
  xxl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
  },
});

export function useShadows() {
  const colors = useThemeColors();
  return buildShadows(colors);
}

export const shadowPresets = {
  card: "xs",
  cardHover: "sm",
  modal: "lg",
  dropdown: "sm",
  nav: "sm",
  fab: "md",
  toast: "sm",
} as const;

export function getShadow(elevation: ShadowElevation, colors: ReturnType<typeof useThemeColors>) {
  return buildShadows(colors)[elevation];
}
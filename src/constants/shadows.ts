// ─── Dual Shadow System ──────────────────────────────────
// Two-layer shadows for depth: ambient (diffuse) + key (directional)
import { useThemeColors } from "../providers/ThemeProvider";

export type ShadowElevation = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  xxl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 16,
  },
});

export function useShadows() {
  const colors = useThemeColors();
  return buildShadows(colors);
}

export const shadowPresets = {
  card: "sm",
  cardHover: "md",
  modal: "xl",
  dropdown: "md",
  nav: "sm",
  fab: "lg",
  toast: "md",
} as const;

export function getShadow(elevation: ShadowElevation, colors: ReturnType<typeof useThemeColors>) {
  return buildShadows(colors)[elevation];
}
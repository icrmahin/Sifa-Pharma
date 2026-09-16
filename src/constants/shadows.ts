import { Platform, type ViewStyle } from "react-native";

type ShadowStyle = ViewStyle;

const isIOS = Platform.OS === "ios";

/**
 * Elevation scale — use with the `shadows` token object.
 * Keep shadow color matched to brand ink (#18201E) for cohesion.
 */
export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ShadowStyle,

  /** Subtle lift — list items, flat cards */
  xs: isIOS
    ? {
        shadowColor: "#18201E",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
      }
    : { elevation: 1 },

  /** Card rest — product cards, inputs */
  sm: isIOS
    ? {
        shadowColor: "#18201E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }
    : { elevation: 2 },

  /** Card hover — elevated panels */
  md: isIOS
    ? {
        shadowColor: "#18201E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      }
    : { elevation: 4 },

  /** Dropdown — menus, modals */
  lg: isIOS
    ? {
        shadowColor: "#18201E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 6,
      }
    : { elevation: 6 },

  /** Floating — drawers, bottom sheets */
  xl: isIOS
    ? {
        shadowColor: "#18201E",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
      }
    : { elevation: 8 },
} as const;

export default shadows;

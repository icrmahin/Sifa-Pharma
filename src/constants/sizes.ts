export const sizes = {
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    pill: 999,
  },

  // Legacy aliases
  cardRadius: 12,
  pill: 999,

  touch: 44,
  buttonHeight: 48,
  inputHeight: 48,
  icon: 20,
  avatar: 44,
  productImage: 140,
  thumbnail: 72,

  containerPadding: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
  },

  maxWidth: {
    sm: 540,
    md: 720,
    lg: 960,
    xl: 1140,
    xxl: 1320,
  },
} as const;

export const borderWidth = {
  thin: 1,
  medium: 2,
  thick: 3,
} as const;

export const opacity = {
  disabled: 0.5,
  pressed: 0.82,
  overlay: 0.4,
  muted: 0.6,
} as const;

export const radius = sizes.borderRadius;

export const duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

export const spring = {
  gentle: { damping: 15, stiffness: 150, mass: 1 },
  snappy: { damping: 20, stiffness: 300, mass: 0.8 },
  bouncy: { damping: 12, stiffness: 200, mass: 1 },
} as const;

export default sizes;

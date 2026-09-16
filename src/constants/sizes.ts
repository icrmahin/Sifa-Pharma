// ─── Border radius ───────────────────────────────────────
export const radius = {
  /** 4px — subtle rounding for small elements */
  sm: 4,
  /** 8px — default for buttons, inputs */
  md: 8,
  /** 12px — cards, panels */
  lg: 12,
  /** 16px — large cards, modals */
  xl: 16,
  /** 20px — feature cards */
  xxl: 20,
  /** 999px — pill shape */
  pill: 999,
} as const;

// ─── Border widths ───────────────────────────────────────
export const borderWidth = {
  /** 1px — hairline borders */
  thin: 1,
  /** 2px — focus rings, emphasis */
  medium: 2,
  /** 3px — heavy emphasis */
  thick: 3,
} as const;

// ─── Touch targets & layout sizes ────────────────────────
export const layout = {
  /** 44px — minimum touch target (iOS/Android guideline) */
  touch: 44,
  /** 48px — default button height */
  buttonHeight: 48,
  /** 48px — default input height */
  inputHeight: 48,
  /** 20px — default icon size */
  icon: 20,
  /** 44px — avatar diameter */
  avatar: 44,
  /** 140px — product card image */
  productImage: 140,
  /** 72px — thumbnail */
  thumbnail: 72,
} as const;

// ─── Container padding (responsive) ──────────────────────
export const containerPadding = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
} as const;

// ─── Max widths ──────────────────────────────────────────
export const maxWidth = {
  sm: 540,
  md: 720,
  lg: 960,
  xl: 1140,
  xxl: 1320,
} as const;

// ─── Opacity ─────────────────────────────────────────────
export const opacity = {
  /** 0.5 — disabled elements */
  disabled: 0.5,
  /** 0.82 — pressed state */
  pressed: 0.82,
  /** 0.4 — overlay / modal backdrop */
  overlay: 0.4,
  /** 0.6 — muted text / secondary pressed */
  muted: 0.6,
} as const;

// ─── Animation durations (ms) ────────────────────────────
export const duration = {
  /** 100ms — micro-interactions */
  instant: 100,
  /** 200ms — button press, chip toggle */
  fast: 200,
  /** 300ms — standard transitions */
  normal: 300,
  /** 500ms — page transitions, modals */
  slow: 500,
} as const;

// ─── Spring physics (for react-native-reanimated) ────────
export const spring = {
  /** Gentle: slow, no bounce — page transitions */
  gentle: { damping: 15, stiffness: 150, mass: 1 },
  /** Snappy: quick settle — button press, toggles */
  snappy: { damping: 20, stiffness: 300, mass: 0.8 },
  /** Bouncy: playful feedback — add-to-cart, favorites */
  bouncy: { damping: 12, stiffness: 200, mass: 1 },
} as const;

// ─── Composite sizes object (backward-compatible) ────────
export const sizes = {
  borderRadius: radius,
  cardRadius: radius.lg,
  pill: radius.pill,
  touch: layout.touch,
  buttonHeight: layout.buttonHeight,
  inputHeight: layout.inputHeight,
  icon: layout.icon,
  avatar: layout.avatar,
  productImage: layout.productImage,
  thumbnail: layout.thumbnail,
  containerPadding,
  maxWidth,
} as const;

export default sizes;

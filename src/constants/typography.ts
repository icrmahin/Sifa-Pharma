// ─── Font families (Sora via @expo-google-fonts/sora) ────
export const fontFamily = {
  regular: "Sora_400Regular",
  medium: "Sora_500Medium",
  semiBold: "Sora_600SemiBold",
  bold: "Sora_700Bold",
} as const;

// ─── Type scale ──────────────────────────────────────────
// All sizes in px. Corresponds to the Sora typeface rhythm.
export const fontSize = {
  /** 34px — hero / splash brand */
  largeTitle: 34,
  /** 28px — screen titles */
  title1: 28,
  /** 22px — section headers */
  title2: 22,
  /** 20px — card titles */
  title3: 20,
  /** 17px — primary body */
  body: 17,
  /** 16px — callout / secondary body */
  callout: 16,
  /** 15px — secondary body / subhead */
  bodySmall: 15,
  /** 15px — subhead (alias) */
  subhead: 15,
  /** 13px — footnotes, helper text */
  footnote: 13,
  /** 12px — captions, labels */
  caption: 12,
  /** 11px — micro labels, badges */
  micro: 11,
} as const;

// ─── Legacy aliases (kept for backward compatibility) ────
export const legacyFontSizes = {
  largeTitle: fontSize.largeTitle,
  title1: fontSize.title1,
  title2: fontSize.title2,
  title3: fontSize.title3,
  headline: fontSize.body,
  body: fontSize.body,
  bodySmall: fontSize.bodySmall,
  callout: fontSize.callout,
  subhead: fontSize.subhead,
  footnote: fontSize.footnote,
  caption1: fontSize.caption,
  caption2: fontSize.micro,
  // aliases used by existing screens
  title: fontSize.largeTitle,
  h1: fontSize.title1,
  h2: fontSize.title2,
  h3: fontSize.title3,
  caption: fontSize.caption,
  label: fontSize.micro,
} as const;

// ─── Line heights ────────────────────────────────────────
export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;

// ─── Letter spacing ──────────────────────────────────────
export const letterSpacing = {
  tight: -0.2,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.2,
} as const;

// ─── Composite typography object (backward-compatible) ───
export const typography = {
  fontFamily,
  ...legacyFontSizes,
  lineHeight,
  letterSpacing,
  letterSpacingDisplay: letterSpacing.normal,
  letterSpacingBody: letterSpacing.normal,
} as const;

export default typography;

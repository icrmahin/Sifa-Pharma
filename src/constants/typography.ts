// ─── Font families ──────────────────────────────────────
// Sora — brand personality, headings, prominent UI
// Inter — operational density, data, tables, body
export const fontFamily = {
  // Sora
  soraRegular: "Sora_400Regular",
  soraMedium: "Sora_500Medium",
  soraSemiBold: "Sora_600SemiBold",
  soraBold: "Sora_700Bold",

  // Inter
  interRegular: "Inter_400Regular",
  interMedium: "Inter_500Medium",
  interSemiBold: "Inter_600SemiBold",
  interBold: "Inter_700Bold",

  // Legacy aliases (backward compat — maps to Sora)
  regular: "Sora_400Regular",
  medium: "Sora_500Medium",
  semiBold: "Sora_600SemiBold",
  bold: "Sora_700Bold",
} as const;

// ─── Type scale ──────────────────────────────────────────
export const fontSize = {
  largeTitle: 34,
  title1: 28,
  title2: 22,
  title3: 20,
  body: 17,
  callout: 16,
  bodySmall: 15,
  subhead: 15,
  footnote: 13,
  caption: 12,
  micro: 11,
} as const;

// ─── Semantic typography tokens ──────────────────────────
// Use these instead of raw font-family + size combinations.
export const semanticType = {
  /** 34px Sora Bold — splash, hero */
  display: { fontFamily: fontFamily.soraBold, fontSize: fontSize.largeTitle },
  /** 28px Sora Bold — screen titles */
  h1: { fontFamily: fontFamily.soraBold, fontSize: fontSize.title1 },
  /** 22px Sora SemiBold — section headers */
  h2: { fontFamily: fontFamily.soraSemiBold, fontSize: fontSize.title2 },
  /** 20px Sora SemiBold — card titles */
  h3: { fontFamily: fontFamily.soraSemiBold, fontSize: fontSize.title3 },
  /** 17px Sora Medium — primary headings */
  title: { fontFamily: fontFamily.soraMedium, fontSize: fontSize.body },
  /** 15px Inter Regular — body text, descriptions */
  body: { fontFamily: fontFamily.interRegular, fontSize: fontSize.bodySmall },
  /** 15px Inter Medium — emphasized body */
  bodyMedium: { fontFamily: fontFamily.interMedium, fontSize: fontSize.bodySmall },
  /** 13px Inter Regular — labels, metadata */
  label: { fontFamily: fontFamily.interRegular, fontSize: fontSize.footnote },
  /** 12px Inter Regular — captions, hints */
  caption: { fontFamily: fontFamily.interRegular, fontSize: fontSize.caption },
  /** 13px Inter SemiBold — buttons */
  button: { fontFamily: fontFamily.interSemiBold, fontSize: fontSize.footnote },
  /** 11px Inter SemiBold — navigation, badges */
  navigation: { fontFamily: fontFamily.interSemiBold, fontSize: fontSize.micro },
  /** 13px Inter Regular — table content */
  table: { fontFamily: fontFamily.interRegular, fontSize: fontSize.footnote },
  /** 22px Inter Bold — dashboard metrics */
  metric: { fontFamily: fontFamily.interBold, fontSize: fontSize.title2 },
} as const;

// ─── Legacy aliases (backward compat) ────────────────────
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

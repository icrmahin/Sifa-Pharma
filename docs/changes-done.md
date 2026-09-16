What Changed
1. Project Identity (Hibbullah → Sifa-Pharma)
File	Change
package.json:2	name: "com.hibbullah.app" → "com.sifapharma.app"
app.json:3-4	name: "hibbullah-pharmacy", slug: "hibbullah-app" → "Sifa-Pharma", "sifa-pharma"
app.json:8	scheme: "comhibbullahapp" → "sifapharma"
app.json:19	package: "com.icrmahin.hibbullahapp" → "com.sifapharma.app"
src/constants/config.ts:2	appName: "Hibbullah" → "Sifa-Pharma"
src/constants/config.ts:7	supportEmail: "support@hibbullah.app" → "support@sifa-pharma.com"
src/providers/AuthProvider.tsx:25	email: "admin@hibbullah.app" → "admin@sifa-pharma.com"
src/components/admin/AdminHeader.tsx:17	"Hibbullah · Admin" → "Sifa-Pharma · Admin"
src/app/(customer)/(tabs)/index.tsx:86	"Hibbullah" → "Sifa-Pharma"
src/app/(customer)/account/overview.tsx:92,102	"Hibbullah · Your account" / "Hibbullah · Customer" → "Sifa-Pharma · ..."
src/app/(auth)/welcome.tsx:29	"Hibbullah" → "Sifa-Pharma"
src/app/(auth)/forgot-password.tsx:13	Default email 'amina@hibbullah.app' → ''
2. Brand Assets
- src/components/common/AppLogo.tsx — Now imports both sifa-logo-dark.png and sifa-logo-white.png. Accepts variant prop ("dark" | "white"). All app.json icon/favicon/splash references updated to sifa-logo-dark.png.
- app.json:7,11,16,23,31 — All hibbullah-logo.png → sifa-logo-dark.png
3. Typography — Sora Font
- Installed: @expo-google-fonts/sora (weights 400, 500, 600, 700)
- Root layout (src/app/_layout.tsx): Loads Sora fonts via useFonts(), holds splash screen with SplashScreen.preventAutoHideAsync() until fonts ready
- src/constants/typography.ts: Added fontFamily map with regular, medium, semiBold, bold keys mapping to Sora font names. All existing numeric tokens preserved.
4. Design Token System Rewrite
src/constants/colors.ts — Full Sifa-Pharma palette:
- primary: #123C35 (deep teal), sage: #8FB8A8, gold: #D7B878
- background: #F6F7F4, surface: #FFFFFF, text: #18201E
- All semantic variants (primarySoft/Muted/Dark/Light, sageSoft/Light, goldSoft/Dark) derived from brand palette
- Status colors, border tokens, ripple colors updated to match new primary
src/constants/shadows.ts — Shadow colors updated from #000 to #18201E (brand ink) for cohesive tone
src/constants/sizes.ts — Extended with:
- borderWidth (thin/medium/thick)
- opacity (disabled/pressed/overlay/muted)
- radius alias
- duration (instant/fast/normal/slow) — 100/200/300/500ms
- spring (gentle/snappy/bouncy) physics values
src/constants/config.ts — Identity updated to Sifa-Pharma
5. Remaining Hibbullah References
Zero remaining in source code (src/). Only surviving in:
- package-lock.json — lockfile artifact, auto-cleared on next pnpm install
- docs/to-do.md — task documentation referencing historical cleanup
Verification
- npx tsc --noEmit — 0 errors
- npm run lint — 0 errors (234 pre-existing warnings, unchanged)
- All customer/admin/auth routes intact
- Sora fonts load via expo-font, splash screen managed correctly
- Logo variants accessible via <AppLogo variant="dark" /> / <AppLogo variant="white" />

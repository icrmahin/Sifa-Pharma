# Sifa-Pharma — Production Authorization Hardening (Final)

## Summary
Real production e-com: Admin (2 allowlisted emails, no phone required) → full dashboard: upload/manage products, delivery, inventory, accept/reject orders, modify. User → register/login, cart, provide phone/address at checkout, place order. Source of truth: `lower(auth.users.email)` via `public.is_admin()`, not `profiles.role`/`user_metadata`/frontend. Migrated to hosted `asamgiqslcvgwibuzqto`, verified local & remote, expo SSR fixed, no fake users/secrets/OAuth.

## Admin Model
- Allowlist: `icrmahin@gmail.com`, `Hibbullah82026@gmail.com` (case-insensitive `lower(email)`).
- `public.is_admin()`: `security definer, search_path=public,auth,pg_catalog`, `select exists (select 1 from auth.users where id=auth.uid() and lower(email) in ('...'))`. Grant to `authenticated,anon,service_role`.
- `custom_access_token_hook`: injects `app_role`/`is_admin` (never overwrites `role='authenticated'` → fixed `role "admin" does not exist` 401).
- `handle_new_user`: derives `role` from email allowlist; admin phone → `null` (allowed), customer phone → `coalesce(...,'')`.
- `enforce_profile_role` (BEFORE on `profiles`): forces `role` to allowlist value, allows admin `phone null`, blocks escalation `update profiles set role='admin' where email='customer@...'` → stays `customer`.
- `sync_profile_on_email_change` (AFTER on `auth.users.email`): verified change flow re-evaluates admin. Backfill corrects existing roles. Partial `idx_profiles_phone where phone is not null and phone<>''` allows multiple empties.

## RLS / Functions
- 25 admin policies re-created with `public.is_admin()` (categories, manufacturers, `products (is_active or is_admin)`, inventory_items, stock_adjustments, orders `auth.uid()=customer_id or is_admin`, order_items, return_requests, delivery_cycles, audit_entries, storage `product-images` admin update/delete).
- `transition_order_status(p_order_id,p_new_status,p_admin_id)`: requires `is_admin()`, `p_admin_id=auth.uid()`, email allowlist check, then `PENDING→CONFIRMED→PROCESSING→OUT_FOR_DELIVERY→DELIVERED`/`CANCELLED`/`RETURNED`.
- `create_order`/`sync_product_stock` unchanged, expiry-aware, FIFO deduction.

## Phone / User Info (Bangladeshi)
- `profiles.phone` relaxed: `drop not null`, check `phone is null or phone='' or phone ~* '^\+?8801[0-9]{9}$'` (`supabase/migrations/20260918080000_fix_phone_bd_and_seed.sql:1`, example `+8801865858544`). Previous Kenyan `+254` removed.
- Admin: phone `null` allowed, no number needed. `src/app/(auth)/register.tsx:22` makes phone optional for admin (`isAdminEmail ? optional : required`), validates Bangladeshi `+8801XXXXXXXXX` if provided.
- User: phone optional at signup, **required at checkout** `src/app/(customer)/checkout.tsx:47` — blocks `createOrder` if `phone` missing/invalid `+8801...` or `selectedAddressId` null, prompts to add via `addresses` table. `src/utils/validation.ts:4` updated to `/^(\+?8801[0-9]{9})$/`. Ensures e-com flow: browse → cart → provide info → order.

## Auth / Deep Links
- `src/lib/supabase.ts:1` SSR guard: `Platform.OS==='web' || typeof window==='undefined'` → no `AsyncStorage` (fixes `window is not defined` on `expo export --platform web`). Web uses `localStorage`, native `AsyncStorage`.
- `src/providers/AuthProvider.tsx:16` `ADMIN_EMAILS` set, `checkIsAdminRpc()` via `rpc is_admin`, `handleSessionChange` uses RPC + allowlist (logs impersonation warn), `login/register` use `emailRedirectTo: Linking.createURL('auth-callback')`, `signUp` throws `Account created... sifapharma://` when `enable_confirmations=true`, `signIn` surfaces `Email not confirmed`.
- `src/app/auth-callback.tsx:1` handles `code`/`token_hash`/`hash` → `exchangeCodeForSession`/`verifyOtp` → `router.replace('/')` or `/reset-password`.
- `src/app/(auth)/forgot-password.tsx:12` `resetPasswordForEmail(..., redirectTo: sifapharma://reset-password)`, `reset-password.tsx:12` `updateUser` with `hasSession` guard.
- `supabase/config.toml:162` `additional_redirect_urls` includes `sifapharma://**`, `sifapharma://auth-callback`, `sifapharma://reset-password`; `enable_confirmations=true` (prod). `app.json:8` `scheme: sifapharma`.

## Migrations
- `20260918060000_prod_auth_hardening.sql` — hardened `is_admin` via `lower(auth.users.email)`, hook, `handle_new_user`, `enforce/sync`, backfill, 25 RLS, hardened `transition_order_status`, partial phone index.
- `20260918070000_prod_ecom_no_phone_admin.sql` — relax `profiles.phone` (`drop not null`, partial index `where phone is not null and <>''`) for admin no-phone.
- `20260918080000_fix_phone_bd_and_seed.sql` — switch Kenyan `+254` → Bangladeshi `+8801[0-9]{9}` (`+8801865858544`), migrate existing phones (`+254...` → `+880...`), update `supabase/seed.sql:197` phones to `+8801712345678`/`+8801865858544`/`+8801923456789`.
- All 3 applied locally (`npx supabase db reset` OK) and hosted (`npx supabase db push` done, `migration list` local=remote 8/8, `db diff --linked` no changes).

## Verification (local `http://127.0.0.1:54321`, hosted `https://asamgiqslcvgwibuzqto.supabase.co` `sb_publishable_egsVfSFXt7aXDAOUfGs5tw_C9qntn9L`)
- `npx tsc --noEmit` 0 errors
- `npx supabase db lint` No schema errors
- `npx eslint` 0 errors (203 warnings pre-existing)
- `CI=1 npx expo export --platform web` Exported: dist (SSR fix verified, prev `window is not defined` gone)
- `curl` categories local+hosted → `[{"id":...}]` (publishable key works, not secret)
- Authz `node /tmp/verify-prod2.js` 13/13:
  A Admin `icrmahin@gmail.com` signup no phone → `is_admin true`, can `select inventory_items`, profile `role admin phone NULL`
  B `Hibbullah82026@gmail.com` no phone → `is_admin true` (lower-case normalization)
  C Customer signup no phone → `is_admin false`, `inventory 0 rows`, checkout would block
  D Customer with phone → signup OK
  E `profiles.role='admin'` escalation → `is_admin false` (trigger blocked)
  F Unauth `is_admin false`, inventory denied
  G Second admin lower-case `hibbullah...` also admin

## Files Changed (this push)
- `supabase/migrations/20260918080000_fix_phone_bd_and_seed.sql` (new, BD `+880`)
- `supabase/seed.sql` (Kenyan → Bangladeshi `+880...`)
- `src/utils/validation.ts` (`254` → `8801[0-9]{9}`)
- `src/utils/navigation.ts` (new, `goBack()` safe wrapper fixes `GO_BACK` warning)
- `src/app/(auth)/login.tsx`, `register.tsx`, `forgot-password.tsx`, `reset-password.tsx`, `src/app/(customer)/*`, `src/app/(admin)/*` (26 files `router.back()` → `goBack()` via `@/utils/navigation`)
- Previous hardening: `20260918060000`, `20260918070000`, `supabase/config.toml`, `src/lib/supabase.ts`, `src/providers/AuthProvider.tsx`, `eas.json:18` hosted `sb_publishable_egsVfS...`, `.env:1` local.

## Environments
- Local: `.env` local, `npx supabase status` running, Studio `http://127.0.0.1:54323`.
- EAS preview/production: `eas.json` hosted URL/key, no `localhost`, no `sb_secret` in `src/app.json/eas.json` (verified `grep -R sb_secret` clean, `.env` gitignored).

## Admin Usage (Real Prod, Bangladeshi)
1. Build: `eas build -p android --profile preview` → APK uses hosted `https://asamgiqslcvgwibuzqto.supabase.co` + `sb_publishable_egsVfS...`
2. On phone/Web `npx expo start --web`: `Welcome → Create account` → email exactly `icrmahin@gmail.com` / `Hibbullah82026@gmail.com`, name, password (>=6), phone leave empty (admin no number) → *Account created* → `sifapharma://auth-callback` → `Sign in` → `is_admin true` → `/(admin)` dashboard → upload/manage products, inventory, `orders/[orderId]` accept/reject via `transition_order_status`, delivery.
3. Customer: any email, phone `+8801XXXXXXXXX` e.g. `+8801865858544` required at `checkout → Submit order` (`+880` Bangladeshi) → `rpc create_order` → `PENDING` → admin sees `Orders`.
4. Password reset: `Login → Forgot` → `sifapharma://reset-password` → `updateUser`.
5. `GO_BACK` fixed: `Header` `onBack` now `goBack()` (`src/utils/navigation.ts:1`) `router.canGoBack()?back:replace('/(auth)/welcome')` → no dev warning on web.

## Hosted Dashboard Manual (required)
- `Authentication → URL Configuration`: `Site URL https://asamgiqslcvgwibuzqto.supabase.co` (or `sifapharma://welcome`), `Additional Redirect URLs` must include `sifapharma://**`, `sifapharma://auth-callback`, `sifapharma://reset-password`, `exp://**`.
- `Authentication → Email → Confirm email: enabled`, `Double confirm changes: enabled`, `Secure password change: disabled` (matches `config.toml`), rate limits as is. Configure SMTP for prod email delivery (default limited to 2/hour).

## Remaining Before Production AAB
- Physical-device test with real allowlisted sign-ups (confirm via `sifapharma://` on device) + customer checkout E2E.
- Configure hosted SMTP.
- Do not commit passwords/secrets; admin creation via real `signUp` (not hashed migration).

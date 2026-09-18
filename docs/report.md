# Sifa-Pharma — Production Report (Final)

## Summary
Full production e-com on `asamgiqslcvgwibuzqto` (Supabase hosted). Admin: `icrmahin@gmail.com`, `Hibbullah82026@gmail.com` (lowercase, `public.is_admin()` via `auth.users.email`, no phone required) → dashboard (products/inventory/orders/delivery, accept/reject via `transition_order_status`). User: any email + Bangladeshi phone `+8801XXXXXXXXX` (e.g. `+8801865858544`) → cart → checkout requires phone + address → `create_order`. Simple auth: put info → check true/false → enter, **no email confirmation**. Expo SSR fixed, `GO_BACK` fixed, BD phone, verified local & hosted, EAS preview/production use publishable only — no secret in git.

## Admin Authorization (Source of Truth: `lower(auth.users.email)`)
- Allowlist `icrmahin@gmail.com`, `hibbullah82026@gmail.com`
- `public.is_admin()`: `security definer, search_path=public,auth,pg_catalog`, `select exists(select 1 from auth.users where id=auth.uid() and lower(email) in (...))` — `grant to authenticated,anon,service_role`
- `custom_access_token_hook`: injects `app_role`/`is_admin`, never overwrites `role='authenticated'` (fixes `role "admin" does not exist` 401)
- `handle_new_user`: derives `role` from allowlist; admin phone → `null` (allowed), customer `coalesce(...,'')`
- `enforce_profile_role` (BEFORE on `profiles`): forces `role` to allowlist value, allows admin `phone null`, blocks `update profiles set role='admin' where customer` → stays customer
- `sync_profile_on_email_change` (AFTER on `auth.users.email`): verified change re-evaluates admin; backfill corrects roles; partial `idx_profiles_phone where phone is not null and phone<>''` allows multiple empties

## RLS / Functions
- 25 admin policies with `public.is_admin()` (categories, manufacturers, `products (is_active or is_admin)`, inventory_items, stock_adjustments, orders `auth.uid()=customer_id or is_admin`, order_items, return_requests, delivery_cycles, audit_entries, storage `product-images` admin update/delete)
- `transition_order_status(p_order_id,p_new_status,p_admin_id)`: requires `is_admin()`, `p_admin_id=auth.uid()`, allowlist check, then `PENDING→CONFIRMED→PROCESSING→OUT_FOR_DELIVERY→DELIVERED`/`CANCELLED`/`RETURNED`
- `create_order`/`sync_product_stock` expiry-aware FIFO

## Phone (Bangladeshi)
- `profiles.phone`: `drop not null`, check `phone is null or '' or ~* '^\+?8801[0-9]{9}$'` (`20260918080000`), example `+8801865858544`
- Migrated Kenyan `+254...` → BD `+8801712345678`/`+8801865858544`/`+8801923456789` (`seed.sql:197`)
- `src/utils/validation.ts:4` → `/^(\+?8801[0-9]{9})$/`; `src/app/(auth)/register.tsx:32` phone optional for admin, required `+880...` for customer; `src/app/(customer)/checkout.tsx:50` blocks `createOrder` if `phone` missing/invalid `+8801...` or no address

## Auth (Simple Instant, No Confirmation)
- `supabase/config.toml:226` `enable_confirmations=false` (simple put-info → enter; previous `true` required `sifapharma://` confirm, now disabled per request)
- `src/lib/supabase.ts:1` SSR guard `Platform.OS==='web' || typeof window==='undefined'` → no `AsyncStorage` on web (fixes `window is not defined` on `expo export`)
- `src/providers/AuthProvider.tsx:16` `ADMIN_EMAILS`, `checkIsAdminRpc()` via `rpc is_admin`, `handleSessionChange` uses RPC+allowlist, `login`/`register` via `supabase.auth.signInWithPassword`/`signUp` with `emailRedirectTo: sifapharma://auth-callback`; `register` now returns session directly (no `Account created… confirm` throw), `login` no `email_not_confirmed` throw
- `src/app/auth-callback.tsx:1` still handles `code`/`token_hash` for future if re-enabled; `forgot-password.tsx:12` `resetPasswordForEmail` → `sifapharma://reset-password`, `reset-password.tsx:11` `updateUser` with `hasSession` guard
- `supabase/config.toml:162` `additional_redirect_urls` includes `sifapharma://**`, `sifapharma://auth-callback`, `sifapharma://reset-password`; `app.json:8` `scheme: sifapharma`
- Frontend copy: `src/app/(auth)/register.tsx:60` `Create account — put info and enter instantly. No email confirmation needed.`

## Navigation Fix (GO_BACK)
- `src/utils/navigation.ts:1` `goBack(fallback) = router.canGoBack()?back:replace('/(auth)/welcome')`
- Replaced 26× `router.back()` → `goBack()` via `@/utils/navigation` (`src/app/(auth)/login.tsx:11`, `register.tsx:11`, `forgot-password.tsx:12`, `reset-password.tsx:11`, `src/app/(customer)/*`, `src/app/(admin)/*`) — fixes `The action 'GO_BACK' was not handled` on web when no history

## Migrations
- `20260918060000_prod_auth_hardening.sql` — hardened `is_admin`, hook, `handle_new_user`, `enforce/sync`, backfill, 25 RLS, `transition_order_status`, partial phone index
- `20260918070000_prod_ecom_no_phone_admin.sql` — relax `profiles.phone` for admin (`drop not null`, partial index)
- `20260918080000_fix_phone_bd_and_seed.sql` — `+254` → `+8801[0-9]{9}`, seed phones to BD
- All 3 applied local (`npx supabase db reset` OK) and hosted (`npx supabase db push` done, `migration list` 8/8, `db diff --linked` no changes)

## Verification
- `npx tsc --noEmit` 0 errors, `npx supabase db lint` No schema errors, `npx eslint` 0 errors (203 warnings), `CI=1 npx expo export --platform web` `Exported: dist`
- `psql` profiles now `+880...` (`admin@sifa.local +8801712345678` etc), `pg_get_functiondef is_admin` shows allowlist
- Simple auth: `POST /auth/v1/signup` with `+880...` → `hasSession true` (was `false` with confirmations), `POST /auth/v1/token` login immediate OK (verified `simpletest2@example.com` + `+8801812345678` → access_token true)
- Authz: admin no-phone signup → `is_admin true`, can `select inventory_items`, profile `role admin phone NULL`; customer `+880...` → `is_admin false`, `inventory 0 rows`; Kenyan `+254...` → check violation `profiles_phone_format`; escalation `role=admin` stays `customer`; unauth `is_admin false`
- `curl` local `http://127.0.0.1:54321/rest/v1/categories` and hosted `https://asamgiqslcvgwibuzqto.supabase.co/rest/v1/categories?limit=1` with `sb_publishable_egsVfS...` → `[{"id":...}]`

## Environments & Keys
- Local `.env:1` → `http://127.0.0.1:54321` + `sb_publishable_ACJWlzQ...` (local `supabase status` publishable), gitignored
- EAS `eas.json:18` preview/production → `https://asamgiqslcvgwibuzqto.supabase.co` + `sb_publishable_egsVfSFXt7aXDAOUfGs5tw_C9qntn9L` (hosted publishable, provided) — verified client-safe
- Secret `sb_secret_lzpxf...` / `service_role` JWT **never** in `src/`, `app.json`, `eas.json`, `EXPO_PUBLIC_*`, or Git (verified `grep -R sb_secret` only in `supabase/.temp` + `docs/report.md` mention, `git ls-files` clean); keep `sb_secret`/`service_role` server-only, rotate if exposed

## Files Changed (final push)
- `supabase/config.toml` (`enable_confirmations=false`)
- `src/providers/AuthProvider.tsx` (remove confirm throw, simple session)
- `src/app/(auth)/register.tsx` (instant copy, no confirm error)
- Previous: `20260918070000`, `20260918080000`, `seed.sql`, `src/utils/validation.ts`, `src/utils/navigation.ts`, 26 `goBack` files, `src/lib/supabase.ts`, `eas.json` hosted publishable

## Usage (Real Prod, Simple)
1. Build: `eas build -p android --profile preview` → APK uses hosted
2. Web: `npx expo start --web` → `Welcome → Create account` → admin `icrmahin@gmail.com`/`Hibbullah82026@gmail.com` no phone or customer `+8801...` → put info → check true/false → `router.replace('/')` → admin `/(admin)` dashboard (products/inventory/orders accept/reject), customer `/(customer)/(tabs)` → add to cart → checkout requires `+8801...` + address → `rpc create_order` → `PENDING`
3. Reset: `Forgot` → `sifapharma://reset-password` → `updateUser`

## Hosted Dashboard Manual
- `Authentication → Providers → Email → Confirm email: OFF` (must match `enable_confirmations=false`; local restarted via `supabase stop/start`)
- `URL Configuration`: `Site URL https://asamgiqslcvgwibuzqto.supabase.co`, `Additional Redirect URLs` includes `sifapharma://**`, `sifapharma://auth-callback`, `sifapharma://reset-password`, `exp://**`
- No secret in client; rotate `sb_secret`/`service_role` if previously shared

## Remaining Before Production AAB
- Physical device test: admin instant login (no phone) and customer `+880...` checkout E2E on APK
- Ensure hosted `Confirm email OFF` (local already OFF)
- Do not commit passwords/secrets

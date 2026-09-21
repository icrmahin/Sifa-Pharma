# Sifa-Pharma — Build TODO (Updated 2026-09-22)

> **Audit scope:** every place "ready for backend but not wired" as of `main` @ `bc2e33c` + full frontend/backend wiring + UI redesign mandates added 2026-09-22. Tables/RPCs exist in Supabase, frontend uses hardcoded `0` / `[]` / `as any` or bypasses service layer. This file is the single source of truth — prior sprint notes archived.

---

## P0 — Must Wire (Backend Exists, Frontend Shows Empty)

- [x] **DB-01 Favorites table missing remotely `supabase/migrations/20260918100000_favorites.sql:2` → app falls back to `AsyncStorage` `src/services/favorites.ts:7` `PGRST205`**
  - Fixed 2026-09-22: `supabase db push --project-ref asamgiqslcvgwibuzqto` applied `20260918100000_favorites.sql` (+ `is_admin_local_parity` + `cost_price`). Verified `curl /rest/v1/favorites → []` no `PGRST205`. Frontend `src/services/favorites.ts:7` now syncs `AsyncStorage → remote` via `syncLocalFavoritesToRemote()` + background sync in `fetchFavorites`/`FavoritesProvider.tsx:24`. Realtime `favorites-changes-{userId}` active, cross-device enabled.

- [x] **DB-02 `products.cost_price` column `supabase/migrations/20260918110000_cost_price.sql:2` — no UI to set it `src/components/admin/ProductForm.tsx:36` `src/services/products.ts:112`**
  - Fixed 2026-09-22: remote column already live via `db push` (verified `select cost_price → 320.00`). Frontend wired: `src/types/product.ts:10` + `src/lib/mappers.ts:22` `costPrice`, `src/components/admin/ProductForm.tsx:48` cost input + validation `cost <= price` + margin preview, `src/services/products.ts:115` `createProduct` writes `cost_price` (default `price*0.8`) and `updateProduct` writes `cost_price`. Dashboard `src/services/admin.ts:181` already prefers `products.cost_price ?? unit*0.8` so profit now exact.

- [x] **DB-03 `return_requests` returns hard-coded empty `src/services/admin.ts:159` `pendingReturns: []`**
  - Fixed 2026-09-22: wired `supabase.from('return_requests').select('id, product_name, customer_name, quantity').eq('status','PENDING').limit(5)` into `fetchAdminDashboard` (`src/services/admin.ts:79`), maps to `pendingReturns` instead of `[]`.

- [x] **DB-04 Storage buckets missing `src/services/storage.ts:22` `product-images`**
  - Fixed 2026-09-22: `supabase/migrations/20260922120000_storage_buckets.sql:2` inserts `product-images` + `avatars` buckets `public=true` + policies on `storage.objects` (public read, authenticated write). Verified `select * from storage.buckets → avatars, product-images`.

- [x] **DB-05 Dashboard 30-day aggregates are client-side in-memory `src/services/admin.ts:59`**
  - Fixed 2026-09-22: created `public.get_admin_dashboard_sales(p_since)` RPC `20260922130000_dashboard_aggregates.sql:2` server-side aggregates (sum qty/revenue/earning + 7-day trends via `generate_series`). `src/services/admin.ts:65` now calls `supabase.rpc('get_admin_dashboard_sales')` with fallback client `reduce` if RPC unavailable, reducing 11 parallel `select('*')` to 9 + RPC.

- [x] **DB-06 Delivery cycle `delivery_cycles` fields stale `src/services/deliveryCycle.ts:4` `src/lib/mappers.ts:94`**
  - Fixed 2026-09-22: created `delivery_cycle_items` table `20260922140000_delivery_cycle_items.sql:2` (FK `delivery_cycles` + `products`, RLS, `sync_delivery_cycle_total()` trigger). `src/services/deliveryCycle.ts:4` now selects `delivery_cycle_items(quantity, products(...))`, `createDeliveryCycle` accepts `items` + `addProductsToCycle`/`removeProductFromCycle`, `estimated_total` auto via trigger. `src/lib/mappers.ts:94` maps `delivery_cycle_items` to `products` with quantity, `delivery-cycle.tsx:72` shows `cycle.products` + pending orders.

- [x] **DB-07 Notifications Realtime not wired `src/services/notifications.ts:5` `src/hooks/useNotifications.ts:7`**
  - Fixed 2026-09-22: `src/hooks/useNotifications.ts:7` now subscribes `supabase.channel('notifications:{userId}').on('postgres_changes' INSERT+UPDATE filter user_id=eq.{id}) → reload` + cleanup via `removeChannel`. Publication `supabase_realtime` extended for `notifications, favorites, products, inventory_items` in `20260922150000_notifications_realtime.sql:2`. Verified `pg_publication_tables` includes 4 tables.

- [x] **DB-08 Audit log never populated `src/services/audit.ts` `supabase/migrations/20260918010000_initial_schema.sql:567` `src/app/(admin)/audit/index.tsx:42`**
  - Fixed 2026-09-22: created `public.audit_log()` security-definer trigger + `audit_entries.actor_id` made nullable, 6 triggers on `orders, products, inventory_items, return_requests, delivery_cycles, order_items` in `20260922160000_audit_triggers.sql:2`. Verified `information_schema.triggers` shows 18 audit triggers. `fetchAuditEntries` now returns data after any mutation; RLS admin-only unchanged.

---

## P1 — Service Layer Bypass / Hardcoded Business Logic

- [x] **SVC-01 Hardcoded `deliveryFee = 150` in 2 places `src/providers/CartProvider.tsx:126` `src/services/cart.ts:78` `src/services/admin.ts:246` `src/constants/config.ts:8`**
  - Fixed 2026-09-22: `CartProvider.tsx:8` + `cart.ts:4` + `mappers.ts:1` now `import config` and `deliveryFee = config.deliveryFee` single source (`CartProvider.tsx:127` `cart.ts:79` `mappers.ts:62`). DB default `delivery_fee 150` stays but client single-source enforced.

- [x] **SVC-02 Customers list N+1 `src/services/customers.ts:14`**
  - Fixed 2026-09-22: migration `20260922180000_customers_stats.sql:2` adds `get_customers_with_stats` + `get_customer_stats` RPCs server-side aggregation + pagination (`limit/offset` + `ilike` search). `customers.ts:14` now `fetchCustomers(query, {limit,offset}) → rpc` with fallback client `range`, maps `order_count/total_spent`. `fetchCustomerById` also via RPC. Verified `select * from get_customers_with_stats(null,5,0) → 1 row`.

- [x] **SVC-03 Returns creating only first item `src/services/returns.ts:22` `src/app/(customer)/order/[orderId].tsx:60`**
  - Fixed 2026-09-22: `returns.ts:22` now `rpc('validate_return')` before insert + `createReturnRequests()` bulk for multi-item (`return_requests` rows per product), throws `AppError` via `supabaseErrorToAppError`. `order/[orderId].tsx:60` now selectable items (Set) with `toggleReturnItem`, defaults to all, `Submit return (n)` creates `n` rows via bulk RPC-validated insert.

- [x] **SVC-04 `ServiceResult<T>` unused `src/lib/result.ts:1` `src/lib/errors.ts:25`**
  - Fixed 2026-09-22: `returns.ts:1` + `customers.ts:1` now `import supabaseErrorToAppError` + `ok/fail ServiceResult`; `fetchReturnsResult` + `fetchCustomersResult` return `ServiceResult` via `ok/fail`, other fns throw `AppError` (unified). Fallback RPC errors mapped via `supabaseErrorToAppError`.

- [x] **SVC-05 Order `timeline` mismatch `supabase/migrations:385` `timeline jsonb` vs docs `order_timeline` table `docs/current-architecture.md:251`**
  - Fixed 2026-09-22: `orders.ts:49` `fetchOrderTimeline` now tries `order_timeline` table first (`order_timeline.label, created_at`), falls back to `orders.timeline` jsonb if `PGRST205` missing-table, throws `AppError` otherwise — supports both canonical jsonb and docs table.

- [x] **SVC-06 Direct Supabase in screens bypassing service `src/app/(customer)/account/profile.tsx:52` `src/app/(admin)/returns/index.tsx:27`**
  - Fixed 2026-09-22: created `services/profile.ts:1` `updateProfile/fetchProfile` with `supabaseErrorToAppError`; `profile.tsx:12` now `import {updateProfile}` and `await updateProfile()`; `returns/index.tsx:14` now `import {fetchReturns}` and `fetchReturns().then` instead of direct `supabase.from`.

---

## P2 — Type Safety / `as any` / Placeholders

- [x] **T-01 `src/lib/mappers.ts:33` `// @ts-ignore` `_rawCategory/_rawManufacturer` + `db: any`**
  - Fixed 2026-09-22: typed `DbProductRow` + `DbOrderRow` etc. with `DbRecord` base, removed `@ts-ignore` and `db: any`, changed to `DbProductRow | null` signatures, preserved `_rawCategory/_rawManufacturer` as `Category | Manufacturer` typed.

- [x] **T-02 `src/providers/AuthProvider.tsx:62,130,177` `as any` session/OTP casts, `src/utils/navigation.ts:7` `router.push as any` `src/app/auth-callback.tsx:36`**
  - Fixed 2026-09-22: `AuthProvider.tsx:62` `type as VerifyOtpType`, `AuthProvider.tsx:130,177` session `id` via `Session & {id?:string}` + `Session` typed `handleSessionChange(Session|null)`, `AuthProvider.tsx:11` import `Session`, `navigation.ts:7` `router.replace(fallback as Href)`, `auth-callback.tsx:36` `type as VerifyOtpType`, `profile.tsx:52` removed `(user as any).phone`.

- [x] **T-03 `src/hooks/useOrders.ts:34` `any[]` order state, `src/hooks/useAdmin.ts:76,114` `any[]`, `src/services/admin.ts:170` `any[]` salesRows**
  - Fixed 2026-09-22: `useOrders.ts:34` `useState<Order|null>` vs `any[]`, `useAdmin.ts:76,114` `Order[]` + `AdminInventoryRow[]` typed (`admin.ts:301` `AdminInventoryRow`), `admin.ts:170` typed `SalesRow`/`ItemRow`/`PendingReturnRow` + `DashboardSalesJson`, filtered `mapProduct/mapOrder` with `filter(Boolean)`.

- [x] **T-04 Hardcoded empty defaults in dashboard `src/app/(admin)/index.tsx:55` `totalSalesQty=0` shows calm when fetch fails, no error**
  - Fixed 2026-09-22: `admin/index.tsx:55` now `if (!dashboard) return EmptyState Retry` before destructuring, removed `dashboard ?? {} =0` defaults — errors surface via `ErrorState` already, empty data shows `EmptyState` not false calm.

---

## P3 — Docs Drift (Not Code Bug, But Must Sync)

- [x] **D-01 `docs/current-architecture.md:395` `docs/frontend-state.md:112` say hooks are placeholder empty arrays — code is already wired `src/hooks/useProducts.ts:39`**
  - Fixed 2026-09-22: `current-architecture.md:395` updated 5.1-5.5 to Wired (fetch via `supabase.from` + pagination/realtime), `frontend-state.md:112` now `Wired (2026-09-22)` with `loading/error/reload` typed.

- [x] **D-02 `order_timeline` table described but not migrated (see SVC-05)**
  - Fixed 2026-09-22: `current-architecture.md:250` now notes canonical `orders.timeline jsonb` + optional `order_timeline` fallback; `orders.ts:49 fetchOrderTimeline()` tries `order_timeline` then fallback on `PGRST205` (see SVC-05).

- [x] **D-03 Free-tier risks listed `docs/current-architecture.md:491` not mitigated: Realtime limits, `pg_cron` for delivery cycles `delivery_cycles.closes_at = now+24h` only client-checked `docs/api-boundaries.md:258`**
  - Fixed 2026-09-22: `current-architecture.md:491` table now Mitigated (unique channel `notifications:{rand}`, publication 4 tables, `get_admin_dashboard_sales` RPC, `delivery_cycle_items` trigger), `api-boundaries.md:258` notes `sync_delivery_cycle_total()` server-side + client `closes_at` check, no `pg_cron` needed.

---

## P4 — Order Invoice Logic (NEW — Client Single-Invoice Rule)

> Rule: `user = x` orders multiple products from one individual account → all products add into **one single invoice**. After client accepts the order, next order attempts create a **separated invoice**. Until acceptance, cart additions must **append to the same pending invoice** — not create new `ORD-` numbers.

- [x] **INV-01 Modify `create_order` RPC `supabase/migrations/20260918010000_initial_schema.sql:714` to append-to-pending-invoice**
  - Fixed 2026-09-22: migration `20260922200000_create_order_append_pending.sql:2` replaces `create_order` — if `select ... where customer_id=p_customer_id and status='PENDING' for update` exists, appends `order_items` (merge duplicate product qty), recalcs `subtotal/total` single `delivery_fee`, `timeline || ITEMS_ADDED`, updates `updated_at`; else creates new `ORD-`. Verified: first cart 1×400 → `ORD-0007` 400, second cart 2×400 append → same `ORD-0007` 1200 qty 3 merged, cart cleared, after `CONFIRMED` next cart → new `ORD-0008` 400.

- [x] **INV-02 Cart → invoice binding `src/providers/CartProvider.tsx:24` `src/services/cart.ts:57`**
  - Fixed 2026-09-22: `create_order` already `delete from cart_items where user_id` in both branches, verified `cart_items` empty after each `create_order`; `CartProvider.tsx:24` `cart-changes` realtime + `loadCart` clears to `items=[]` 0, `checkout.tsx:43` `createOrder()` success already shows `View cycle` and cart empty `EmptyState`.

- [x] **INV-03 Invoice UI `src/app/(customer)/(tabs)/orders.tsx:16` `src/components/orders/OrderCard.tsx:16`**
  - Fixed 2026-09-22: single `PENDING` invoice verified (one `ORD-0007` while pending, second after `CONFIRMED` creates `ORD-0008`); `OrderCard` shows `items.length` + `total` aggregated, timeline shows `ITEMS_ADDED` entry via `orders.timeline` jsonb; `orders.tsx:16` + `OrderCard` naturally reflect appended state without extra UI (single pending).

---

## P5 — Real-time Stock + Notifications + Auto-Deactivate (NEW)

- [x] **STK-01 Realtime stock updates `supabase/migrations/20260918010000_initial_schema.sql:662` `src/hooks/useProducts.ts:39`**
  - Fixed 2026-09-22: `products` + `inventory_items` already in `supabase_realtime` publication `20260922150000`; `useProducts.ts:39` now subscribes `supabase.channel('products-stock:{rand}').on('*' products) + on('*' inventory_items) → reload`, cleanup `removeChannel`; verified via `pg_publication_tables`.

- [x] **STK-02 Stock-out trigger → auto-deactivate `public.products` `src/services/products.ts:112`**
  - Fixed 2026-09-22: migration `20260922210000_stock_auto_deactivate.sql:2` replaces `sync_product_stock()` (security definer) to update `products.stock` + `is_active = false` when `v_new_stock <=0` and `true` on restock (`v_old_stock <=0` → `v_new_stock>0`), plus `handle_product_stock_change()` before update on `products.stock` for direct edits. Verified: `inventory 0 → stock 0 is_active false`, restock 20 → `true`.

- [x] **STK-03 Stock-out notifications `public.notifications` `src/services/notifications.ts:5`**
  - Fixed 2026-09-22: same trigger inserts `notifications` for `cart_items`∪`favorites`∪`order_items`∪`admin` on `stock 0` (`alert`) and `low stock <10` (`warning` threshold `config.lowStockThreshold 10`) in same migration; verified `Out of stock: Napa Extend 665 mg` inserted then cleaned, low-stock path tested.

- [x] **STK-04 Cart reset guarantee `src/services/orders.ts:39` `src/providers/CartProvider.tsx:114`**
  - Fixed 2026-09-22: `create_order` (both branches `INV-01`) `delete from cart_items where user_id` verified empty after each order; `CartProvider.tsx:24` `cart-changes:{userId}` realtime + `loadCart → items=[]` tested via P4 append scenario (3 appends cart 0, new after CONFIRMED).

---

## P6 — Product Management Simplicity + Image Optimization (NEW)

- [x] **PM-01 Simplify add/edit/deactivate/delete/update `src/components/admin/ProductForm.tsx:17` `src/services/products.ts:112`**
  - Fixed 2026-09-22: `ProductForm.tsx:17` Batch section now collapsible `Advanced · batch & expiry (auto if empty)` (`showAdvanced` state, `advancedToggle` `Pressable`), hint auto `BATCH-XXXX-001`, stock handled via inventory auto; `products.ts:112` `deleteProduct` soft `is_active=false` if `order_items` exists, else hard delete + inventory cleanup; added `deactivateProduct`/`activateProduct`; IDs auto `gen_random_uuid()`.

- [x] **IMG-01 Highly optimized image upload `src/services/storage.ts:22` `src/components/common/ImageUpload.tsx`**
  - Fixed 2026-09-22: added `expo-image-manipulator@~57.0.10` to `package.json:16`, `storage.ts:22` now `compressImage()` resize max 1024 (thumb 320) quality 0.75 webp, enforce 5MB `ALLOWED_MIME`, `uploadProductImage(..., {thumb})` handles both, `resolveProductImageUriWithThumb` for thumb 320, fallback to raw if manipulator unavailable (web). Bucket `product-images` already `20260922120000` public.

---

## P7 — Frontend Wiring + Consistent Measurement + Redesign (NEW)

> All frontend wired to backend — no screen shows hardcoded `0` / `[]` / fallback empty when backend has data. Layout uses `src/constants/spacing.ts` `src/constants/sizes.ts` `radius pill 999 / lg 16 / xl 20 / cardRadius` `src/constants/shadows.ts` `xs 0.04` `src/constants/typography.ts` PJS strictly.

- [ ] **UX-01 Full frontend-backend wiring audit `src/app/(customer)/**` `src/app/(admin)/**`**
  - Every screen that can fetch from Supabase must use service hook (`useProducts`/`useOrders`/`useAdmin`/`useNotifications`/`useDeliveryCycle`) not hardcoded defaults. Fix `src/app/(admin)/index.tsx:55` default `0` hiding errors with proper `ErrorState`.

- [ ] **UI-01 Home ProductCard redesign `src/components/products/ProductCard.tsx:21` `src/app/(customer)/(tabs)/index.tsx:131`**
  - Replace absolute `actionsRow` + `paddingBottom 56` hack. New: soft feather island `radius xl 20` `shadows.sm` `backgroundAlt`, image `aspect 1 contain` + floating favorite pill top-right, price row `price + original strikethrough + discount badge`, stock indicator `dot + text` using `config.lowStockThreshold`, primary `Add to cart` as full-width pill `radius pill 999` (not 28px icon). `out_of_stock` overlay + crossfade. Grid gutter `spacing.md` consistent.

- [ ] **UI-02 Filters redesign `src/components/common/FilterChip.tsx:8` `src/app/(customer)/(tabs)/products.tsx:48` `src/app/(customer)/(tabs)/index.tsx:143`**
  - Unify chips: single `FilterGroup` component `minHeight 36` `radius pill 999` `shadows.xs` `gap spacing.sm`. Selected `primarySoft+primary border` else `backgroundAlt+borderLight`. Horizontal `ScrollView` `contentContainerStyle gap spacing.sm`. Replace duplicated `chipSelected` empty styles. Home discovery pills (All/Trending/Discount/New) same system.

- [ ] **UI-03 OrderCard redesign `src/components/orders/OrderCard.tsx:16` `src/app/(customer)/(tabs)/orders.tsx:50` `src/app/(customer)/order/[orderId].tsx:60`**
  - Island `radius xl 20` `borderSoft` `shadows.xs` `padding spacing.lg`. Header `orderNumber + StatusBadge` row, meta `date · items · payment`, footer `total + chevron pill` (no `View details` text link), optional timeline dot preview. Single component for customer + admin list consistency.

- [ ] **M-01 Measurement audit `src/constants/spacing.ts` `src/constants/sizes.ts` `src/constants/shadows.ts`**
  - Sweep all screens for inconsistent `spacing`/`radius`/`shadow` values; replace raw numbers with tokens. Verify `ResponsiveContainer` `maxWidth 1320` + `paddingHorizontal spacing.lg` everywhere.

---

## P8 — Next Steps Order (Suggested Priority)

1. Push `favorites` + `cost_price` migrations + wire `ProductForm` + create `product-images`/`avatars` buckets (DB-01/02/04 + IMG-01 bucket part + PM-01).
2. Wire `pendingReturns`, fix Realtime notifications channel, create audit triggers (DB-03/07/08).
3. Replace client 30d aggregation with RPC/view; paginate `fetchCustomers`/`fetchAdminDashboard` (DB-05 + SVC-02).
4. Implement single-invoice `create_order` append logic + cart reset guarantee (INV-01/02 + STK-04).
5. Stock realtime + auto-deactivate + notifications (STK-01/02/03 + DB-06 delivery_cycle fix).
6. Simplify product CRUD + image optimization (PM-01 + IMG-01).
7. UI redesign `ProductCard` → `Filters` → `OrderCard` + measurement audit (UI-01/02/03 + M-01 + UX-01).
8. Type safety `as any` cleanup + docs sync (T-01..T-04 + D-01..D-03).

---

## Foundation (Done, Kept for History)

- [x] 01 Project foundation — TS, Expo, ESLint, Git
- [x] 02 Brand assets — logos, fonts
- [x] 03 Design tokens — palette `#123C35 #8FB8A8 #D7B878`, typography, spacing, feather radius `10/12/16/20`, shadows `xs 0.04`
- [x] 04 Core UI — primitives, inputs, cards
- [x] 05 Soft feather UI — `SoftHeader` island `radius lg 16 shadow sm`, `CustomerNavigation` island `xl 20`, `AdminHeader/Drawer` soft
- [x] 06 Backend schema — `profiles, products, cart_items, orders, order_items, addresses, inventory_items, notifications, delivery_cycles, favorites, cost_price`
- [x] 07 Product architecture — roles, flows (admin can shop, customer shop-only)

Sequence: **Brand → Tokens → UI → Backend → Features → Integration → Testing → EAS → Release**

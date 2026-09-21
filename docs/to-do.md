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

- [ ] **SVC-01 Hardcoded `deliveryFee = 150` in 2 places `src/providers/CartProvider.tsx:126` `src/services/cart.ts:78` `src/services/admin.ts:246` `src/constants/config.ts:8`**
  - Should read from `config.deliveryFee` single source.

- [ ] **SVC-02 Customers list N+1 `src/services/customers.ts:14`**
  - `fetchCustomers` does `select profile` then `select * from orders` for every customer to compute `orderCount/totalSpent` client-side, no pagination.

- [ ] **SVC-03 Returns creating only first item `src/services/returns.ts:22` `src/app/(customer)/order/[orderId].tsx:60`**
  - `order.items[0]` → ignores multi-item orders; status via direct `update` not `validate_return` RPC `migrations:815`.

- [ ] **SVC-04 `ServiceResult<T>` unused `src/lib/result.ts:1` `src/lib/errors.ts:25`**
  - Helpers `ok`/`fail`/`supabaseErrorToAppError` exist but services throw raw `error`. Error handling not unified.

- [ ] **SVC-05 Order `timeline` mismatch `supabase/migrations:385` `timeline jsonb` vs docs `order_timeline` table `docs/current-architecture.md:251`**
  - Frontend reads `orders.timeline` jsonb; docs describe separate `order_timeline` table that does not exist.

- [ ] **SVC-06 Direct Supabase in screens bypassing service `src/app/(customer)/account/profile.tsx:52` `src/app/(admin)/returns/index.tsx:27`**
  - Should use `profileService` / `returnsService`.

---

## P2 — Type Safety / `as any` / Placeholders

- [ ] **T-01 `src/lib/mappers.ts:33` `// @ts-ignore` `_rawCategory/_rawManufacturer` + `db: any`**
- [ ] **T-02 `src/providers/AuthProvider.tsx:62,130,177` `as any` session/OTP casts, `src/utils/navigation.ts:7` `router.push as any` `src/app/auth-callback.tsx:36`**
- [ ] **T-03 `src/hooks/useOrders.ts:34` `any[]` order state, `src/hooks/useAdmin.ts:76,114` `any[]`, `src/services/admin.ts:170` `any[]` salesRows**
- [ ] **T-04 Hardcoded empty defaults in dashboard `src/app/(admin)/index.tsx:55` `totalSalesQty=0` shows calm when fetch fails, no error**

---

## P3 — Docs Drift (Not Code Bug, But Must Sync)

- [ ] **D-01 `docs/current-architecture.md:395` `docs/frontend-state.md:112` say hooks are placeholder empty arrays — code is already wired `src/hooks/useProducts.ts:39`**
- [ ] **D-02 `order_timeline` table described but not migrated (see SVC-05)**
- [ ] **D-03 Free-tier risks listed `docs/current-architecture.md:491` not mitigated: Realtime limits, `pg_cron` for delivery cycles `delivery_cycles.closes_at = now+24h` only client-checked `docs/api-boundaries.md:258`**

---

## P4 — Order Invoice Logic (NEW — Client Single-Invoice Rule)

> Rule: `user = x` orders multiple products from one individual account → all products add into **one single invoice**. After client accepts the order, next order attempts create a **separated invoice**. Until acceptance, cart additions must **append to the same pending invoice** — not create new `ORD-` numbers.

- [ ] **INV-01 Modify `create_order` RPC `supabase/migrations/20260918010000_initial_schema.sql:714` to append-to-pending-invoice**
  - If `select id from orders where customer_id=p_customer_id and status='PENDING' for update` exists: append `order_items`, recalc `subtotal/discount/delivery_fee/total`, update `updated_at`, do not generate new `order_number`. Else create new `ORD-`. `src/services/orders.ts:39` `createOrder` stays same interface.
  - Acceptance status definition (default `CONFIRMED` via `transition_order_status` `migrations:762`) gates new invoice creation. `src/hooks/useOrders.ts` + `src/app/(customer)/checkout.tsx:43` must handle append vs create feedback.

- [ ] **INV-02 Cart → invoice binding `src/providers/CartProvider.tsx:24` `src/services/cart.ts:57`**
  - Ensure `CartProvider` does not assume new order per checkout; after invoice append, cart still clears to 0 via `delete from cart_items` but invoice shows merged line items. `CheckoutScreen` success message must show existing `orderNumber` vs new.

- [ ] **INV-03 Invoice UI `src/app/(customer)/(tabs)/orders.tsx:16` `src/components/orders/OrderCard.tsx:16`**
  - Orders list must show single pending invoice with aggregated items (quantity+total) while pending; history shows separated invoices only after acceptance. `OrderDetail` `src/app/(customer)/order/[orderId].tsx:60` needs append-aware timeline.

---

## P5 — Real-time Stock + Notifications + Auto-Deactivate (NEW)

- [ ] **STK-01 Realtime stock updates `supabase/migrations/20260918010000_initial_schema.sql:662` `src/hooks/useProducts.ts:39`**
  - Enable `supabase_realtime` publication for `products` + `inventory_items`. Frontend subscribes `supabase.channel('stock').on('postgres_changes', {table:'products'})` or `useProducts` polling fallback. Free-tier WS cost mitigated per `docs/api-boundaries.md:258`.

- [ ] **STK-02 Stock-out trigger → auto-deactivate `public.products` `src/services/products.ts:112`**
  - Trigger after `sync_product_stock`: when `stock <= 0` → `update products set is_active=false where id=NEW.product_id`. RLS `Anyone can view active products` `migrations:160` then hides it. Reactivate only via admin restock (`inventory_items.quantity > 0`).

- [ ] **STK-03 Stock-out notifications `public.notifications` `src/services/notifications.ts:5`**
  - Same trigger inserts `notifications(user_id, title, body, type='alert')` for: (a) all customers with product in `cart_items`/`favorites`/`past orders`, (b) admin users. Body: `Out of stock: {name} hidden — restock to reactivate.` Also `lowStockThreshold` `src/constants/config.ts:9` warning at `<10`.

- [ ] **STK-04 Cart reset guarantee `src/services/orders.ts:39` `src/providers/CartProvider.tsx:114`**
  - After placing order (new or appended invoice), `cart_items` deleted + `CartProvider.loadCart` clears to `items=[]` default state 0. Verify `create_order` `delete from cart_items` + realtime `cart-changes` channel handles it.

---

## P6 — Product Management Simplicity + Image Optimization (NEW)

- [ ] **PM-01 Simplify add/edit/deactivate/delete/update `src/components/admin/ProductForm.tsx:17` `src/services/products.ts:112`**
  - Admin never manages IDs manually. Auto: `id uuid gen_random_uuid()`, `order_number` trigger, `batch_number` default `BATCH-{shortId}-001` `products.ts:139`, `stock` derived from `inventory_items` sum. Form only asks `name/brand/generic/category/manufacturer/price/description/image/unit`; `cost_price` wired (DB-02) optional with default `price*0.8`. Delete = soft `is_active=false` unless no orders.
  - Hide `batchNumber/expiryDate` manual complexity behind optional advanced section; system handles `inventory_items` insert automatically.

- [ ] **IMG-01 Highly optimized image upload `src/services/storage.ts:22` `src/components/common/ImageUpload.tsx`**
  - Before `supabase.storage.from('product-images').upload`, compress via `expo-image-manipulator`: resize max 1024×1024, quality 0.75, convert to `webp` (fallback `jpg`), strip EXIF, enforce 5MB MIME `jpg/png/webp`. Generate thumb `320px` variant stored as `secondary_image_url` via Supabase `transform` or client resize.
  - Bucket migration: `insert into storage.buckets (id,name,public)` for `product-images` + `avatars` (`public=true`, `authenticated write` policy) — fixes DB-04.

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

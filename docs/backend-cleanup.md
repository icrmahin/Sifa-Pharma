# Backend Cleanup

Date: 2026-09-17
Intent: Destructive removal of inherited Supabase/backend and mock architecture. Preserve UI frontend only.

## What was removed

### Supabase
- `src/lib/supabase.ts` — client init with SecureStore adapter
- `src/lib/session.ts` — SecureStore/localStorage session persistence
- `src/lib/storage.ts` — Supabase Storage helpers (getProductImageUrl, uploadProductImage, deleteProductVariantImage)
- `src/lib/env.ts` — EXPO_PUBLIC_SUPABASE_URL / ANON_KEY / useMock flag
- `src/types/database.ts` — Supabase Database row types (admin_users, profiles, products, etc.)
- `src/services/authService.ts` — Google OAuth via supabase.auth.signInWithOAuth, WebBrowser, Session resolution, profiles upsert
- `.env` — EXPO_PUBLIC_SUPABASE_URL / ANON_KEY / EXPO_PUBLIC_USE_MOCK
- `supabase/` directory — migrations `20260914141707_remote_commit.sql`, `20260914143041_remote_schema.sql`
- `app.json` plugin `expo-secure-store`
- `Supabase` imports from `src/types/auth.ts` (Session)

### Inherited auth/authorization
- `verifyAdminStatus` querying `admin_users` table (ilike)
- `resolveMockAdminSession` / mock session in AuthProvider
- Supabase `onAuthStateChange` listener, `getSession`, `syncSession`, session persistence via saveSession/clearSession
- Role override logic based on Supabase admin verification
- Google OAuth flow (expo-auth-session + expo-web-browser)

### Mock backend architecture
- `src/services/mockData.ts` — AppStore, seedProducts (6), users/addresses/categories/manufacturers/cart/orders/deliveryCycle/notifications/inventory/adjustments/returns/audit/customers
- `src/services/productService.ts` — getProducts/getProductById/search with wait() latency
- `src/services/cartService.ts` — summarizeCart/addToCart/updateCartQuantity
- `src/services/orderService.ts` — getOrders/submitOrder/updateOrder with 24h cycle logic
- `src/services/categoryService.ts`, `manufacturerService.ts`, `notificationService.ts`, `deliveryCycleService.ts`, `addressService.ts`
- `src/services/admin/*` — adminProductService, dashboardService, inventoryService, orderManagementService, customerService, reportService, returnService, batchService, auditService
- `src/lib/result.ts` — `wait()` artificial backend latency (kept ok/fail helpers)
- Fake persistence via mutable `store` object

## What was preserved (Frontend)

### UI — no visual changes
- Screens, layouts, navigation, spacing, typography, colors, icons, animations, forms, cards
- `src/app/(customer)/**` and `src/app/(admin)/**` file structure intact; all routes remain reachable
- `src/components/**` — ProductCard, CategoryCard, ManufacturerCard, OrderCard, AdminProductCard, ProductForm, ImageUpload, Button, Input, etc.
- `src/constants/**` — colors, spacing, typography, shadows, sizes, config
- Responsive behavior and visual hierarchy unchanged

### Domain types (preserved)
- `src/types/product.ts`, `order.ts`, `user.ts`, `address.ts`, `inventory.ts`, `category.ts`, `manufacturer.ts`, `notification.ts`, `return.ts`, `cart.ts`, `audit.ts`, `deliveryCycle.ts`, `auth.ts` (AuthSession/Role without Supabase Session)

### Minimal frontend state (intentionally unfinished)
- `src/providers/AuthProvider.tsx` — now frontend-only dev stub: DEV_USER/DEV_SESSION in React state, no persistence, signOut/login/register stubs
- `src/providers/CartProvider.tsx` — empty items/summary, stub addItem/setQuantity/removeItem
- `src/hooks/*` — useAdmin/useProduct/useProducts/useOrders/useDeliveryCycle/useNotifications now placeholder hooks returning empty state
- `src/components/admin/ProductForm.tsx` — kept intact, onSubmit now plumbs to parent stub
- `src/components/common/ImageUpload.tsx` — kept intact, onPick/onRemove are local URI callbacks, no storage upload

## Dependencies removed
- `@supabase/supabase-js@^2.116.0` (and transitive @supabase/auth-js, storage-js, etc.)
- `expo-auth-session@~57.0.12` — only used for Google OAuth
- `expo-secure-store@~57.0.4` — only used for Supabase session storage
- `expo-web-browser@~57.0.3` — only used for OAuth WebBrowser
- `react-native-url-polyfill@^4.0.0` — polyfill required by @supabase/supabase-js
- `expo-secure-store` removed from `app.json` plugins

Retained (UI required): `expo`, `expo-constants`, `expo-device`, `expo-font`, `expo-image`, `expo-image-picker`, `expo-linking`, `expo-router`, `expo-splash-screen`, `expo-status-bar`, `expo-symbols`, `expo-system-ui`, `react`, `react-native`, gesture-handler, reanimated, safe-area-context, screens, web compilation

## Files modified
- `src/providers/AuthProvider.tsx` (rewritten frontend-only)
- `src/providers/CartProvider.tsx` (rewritten frontend-only)
- `src/hooks/useAdmin.ts`, `useProduct.ts`, `useProducts.ts`, `useOrders.ts`, `useDeliveryCycle.ts`, `useNotifications.ts` (stubbed)
- `src/types/auth.ts` (removed Session import, removed syncSession)
- `src/lib/result.ts` (removed wait)
- `src/app/index.tsx` (removed auth gating, direct redirect to customer tabs)
- `src/app/(customer)/_layout.tsx`, `src/app/(admin)/_layout.tsx` (removed auth gating)
- `src/app/(auth)/welcome.tsx` (removed authService, handleGoogleLogin stub)
- `src/app/(customer)/(tabs)/index.tsx`, `products.tsx`, `orders.tsx`, `products/[productId].tsx`, `products/categories.tsx`, `category/[categoryId].tsx`, `manufacturers.tsx`, `manufacturer/[manufacturerId].tsx`, `search.tsx`, `account/addresses.tsx`, `notifications.tsx`, `profile.tsx`, `delivery-cycle.tsx`, `order/[orderId].tsx`, `checkout.tsx`
- `src/app/(admin)/index.tsx`, `products/index.tsx`, `products/add.tsx`, `products/[productId]/index.tsx`, `products/[productId]/edit.tsx`, `inventory/*`, `orders/*`, `customers/*`, `reports/*`, `returns/*`, `audit/index.tsx`
- `package.json`, `app.json`

## Files deleted
- `src/lib/supabase.ts`
- `src/lib/session.ts`
- `src/lib/storage.ts`
- `src/lib/env.ts`
- `src/services/mockData.ts`
- `src/services/authService.ts`
- `src/services/productService.ts`
- `src/services/cartService.ts`
- `src/services/orderService.ts`
- `src/services/categoryService.ts`
- `src/services/manufacturerService.ts`
- `src/services/notificationService.ts`
- `src/services/deliveryCycleService.ts`
- `src/services/addressService.ts`
- `src/services/admin/adminProductService.ts`
- `src/services/admin/auditService.ts`
- `src/services/admin/batchService.ts`
- `src/services/admin/customerService.ts`
- `src/services/admin/dashboardService.ts`
- `src/services/admin/inventoryService.ts`
- `src/services/admin/orderManagementService.ts`
- `src/services/admin/reportService.ts`
- `src/services/admin/returnService.ts`
- `src/types/database.ts`
- `supabase/migrations/20260914141707_remote_commit.sql`
- `supabase/migrations/20260914143041_remote_schema.sql`
- `.env`

## What remains intentionally unfinished
- Auth: no session persistence, no login, no OAuth. AuthProvider returns hardcoded dev admin.
- Data: no fetch/persistence. All screens show empty/placeholder state (EmptyState or single placeholder object).
- Cart: no persistence, addItem is no-op.
- Checkout: form renders but submitOrder is no-op.
- Product image upload: ImageUpload UI renders, onPick stores local URI in form state, no upload/persistence.
- Admin actions (create/edit/delete product, confirm order, adjust inventory, etc.) are no-ops driving frontend state only or navigating back.
- All hooks return empty arrays/null with loading=false.

## Where backend will connect
- `src/providers/AuthProvider.tsx` — replace DEV_SESSION with real auth (signIn, signOut, session refresh, role verification).
- `src/providers/CartProvider.tsx` — connect addItem/setQuantity/removeItem/refresh to cart API; restore summarizeCart from server or shared util.
- `src/hooks/*` — reinstate data fetching against real endpoints.
- `src/app/**/checkout.tsx`, `products/add.tsx`, `products/[productId]/edit.tsx` — wire onSubmit to create/update endpoints.
- `src/components/admin/ProductForm.tsx` — keep as-is; parent will handle uploadProductImage → new storage backend; ImageUpload's onPick local URI will be uploaded before product create/update.
- `src/lib/result.ts` — ok/fail helpers remain reusable for service results.
- Domain types in `src/types/*` define the shape expected from the future backend; map server rows to these types.

## Frontend assumptions needing backend later
- User has id/name/email/phone/role/createdAt; session has id/userId/role/email/phone/isAdmin.
- Products have isActive/isFeatured, image/primaryImage/secondaryImage as URL or storage path.
- Inventory keyed by productId/batchNumber with status healthy/low/out_of_stock.
- Orders have PENDING/CONFIRMED/PROCESSING/OUT_FOR_DELIVERY/DELIVERED/CANCELLED/RETURNED and timeline entries.
- Auth gating assumed admin via role/isAdmin; customer layouts assumed authenticated customer.

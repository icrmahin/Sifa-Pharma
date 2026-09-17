# Sifa-Pharma — Product Requirements

> **Architecture Constraint**: Sifa-Pharma must operate entirely on the **Supabase Free plan** ($0 budget). Every requirement below is evaluated against this constraint.

---

## 1. Purpose

Sifa-Pharma is a mobile pharmacy application that allows customers to browse medicines, manage a shopping cart, place orders, and track deliveries. Administrators can manage the product catalog, inventory, orders, customers, returns, and audit logs. The app targets the Kenyan pharmaceutical market (KES currency, Kenyan phone number format).

---

## 2. Confirmed Requirements

The following requirements exist in the current codebase and are evaluated against Supabase Free feasibility.

### 2.1 Customer-Facing

| # | Requirement | Evidence | Supabase Free Feasibility |
|---|-------------|----------|--------------------------|
| CR-01 | Product browsing by category, manufacturer, and search | `src/app/(customer)/products/`, `src/app/(customer)/search.tsx` | **FREE** — Simple PostgreSQL queries with RLS |
| CR-02 | Product detail view with images, pricing, stock status, batch/expiry info | `src/app/(customer)/products/[productId].tsx` | **FREE** — Read query + Supabase Storage for images |
| CR-03 | Shopping cart with add/remove/quantity update | `src/providers/CartProvider.tsx`, `src/app/(customer)/(tabs)/cart.tsx` | **FREE** — PostgreSQL table with RLS scoped to user |
| CR-04 | Checkout with delivery address and order submission | `src/app/(customer)/checkout.tsx` | **FREE** — INSERT transaction in PostgreSQL |
| CR-05 | Order placement with Cash on Delivery (COD) as the only payment method | `src/types/order.ts`, `src/app/(customer)/checkout.tsx` | **FREE** — COD requires no payment gateway integration |
| CR-06 | Order history and order detail tracking | `src/app/(customer)/(tabs)/orders.tsx`, `src/app/(customer)/order/[orderId].tsx` | **FREE** — SELECT queries with user-scoped RLS |
| CR-07 | Delivery cycle view (24-hour order cycle) | `src/app/(customer)/delivery-cycle.tsx`, `config.orderCycleHours: 24` | **FREE WITH USAGE CONSTRAINT** — Simple daily cron-like logic, but requires scheduled job (see FREE-TIER RISK) |
| CR-08 | Customer account with profile, addresses, notifications, settings | `src/app/(customer)/account/` | **FREE** — Standard CRUD with RLS |
| CR-09 | Address management (add/edit addresses) | `src/app/(customer)/address/edit.tsx`, `src/types/address.ts` | **FREE** — Standard CRUD with RLS |
| CR-10 | Authentication (login, registration, forgot-password, reset-password) | `src/app/(auth)/`, `src/types/auth.ts` | **FREE** — Supabase Auth provides all of this at no cost |
| CR-11 | Search across product name, brand, generic name, description | `src/app/(customer)/search.tsx` | **FREE** — PostgreSQL `ILIKE` or `pg_trgm` extension |
| CR-12 | Categories and manufacturer browsing | `src/app/(customer)/products/categories.tsx`, `src/app/(customer)/products/manufacturers.tsx` | **FREE** — Simple read queries |
| CR-13 | Product filtering by stock status and category | `src/app/(admin)/products/index.tsx` (filters) | **FREE** — WHERE clauses in PostgreSQL |
| CR-14 | Notifications screen | `src/app/(customer)/account/notifications.tsx`, `src/types/notification.ts` | **FREE WITH USAGE CONSTRAINT** — Simple table, but real-time delivery requires Supabase Realtime (FREE-TIER RISK) |
| CR-15 | Delivery fee of KSh 150 | `src/constants/config.ts` (`deliveryFee: 150`) | **FREE** — Config constant, no external service |

### 2.2 Admin-Facing

| # | Requirement | Evidence | Supabase Free Feasibility |
|---|-------------|----------|--------------------------|
| AR-01 | Product catalog management (add/edit/view/deactivate products) | `src/app/(admin)/products/`, `src/components/admin/ProductForm.tsx` | **FREE** — Standard CRUD |
| AR-02 | Inventory management with batch-level tracking | `src/app/(admin)/inventory/`, `src/types/inventory.ts` | **FREE** — PostgreSQL table with RLS |
| AR-03 | Stock adjustment (increase/decrease with reason) | `src/app/(admin)/inventory/adjustment.tsx`, `src/types/inventory.ts` | **FREE** — INSERT into stock_adjustments table |
| AR-04 | Batch and expiry monitoring | `src/app/(admin)/inventory/batches.tsx`, `src/app/(admin)/inventory/expiry.tsx` | **FREE** — SELECT with WHERE conditions |
| AR-05 | Order management (view, confirm, cancel orders) | `src/app/(admin)/orders/`, `src/app/(admin)/orders/[orderId].tsx` | **FREE** — UPDATE status with RLS |
| AR-06 | Customer record management | `src/app/(admin)/customers/` | **FREE WITH USAGE CONSTRAINT** — Simple SELECT, but PII handling has RLS implications (see NOT SUITABLE / FREE-TIER RISK) |
| AR-07 | Return request management (approve/reject/process) | `src/app/(admin)/returns/`, `src/types/return.ts` | **FREE** — Standard CRUD with RLS |
| AR-08 | Reports (sales report, inventory report) | `src/app/(admin)/reports/` | **FREE WITH USAGE CONSTRAINT** — Aggregation queries on small dataset are fine, but complex reporting may need server-side computation (FREE-TIER RISK) |
| AR-09 | Audit log | `src/app/(admin)/audit/index.tsx`, `src/types/audit.ts` | **FREE** — INSERT-only log table |
| AR-10 | Dashboard with key metrics and attention items | `src/app/(admin)/index.tsx` | **FREE WITH USAGE CONSTRAINT** — Simple COUNT/SUM queries |
| AR-11 | Low stock threshold of 10 units | `src/constants/config.ts` (`lowStockThreshold: 10`) | **FREE** — Config constant |
| AR-12 | Expiry warning of 60 days | `src/constants/config.ts` (`expiryWarningDays: 60`) | **FREE** — Date comparison in query |

### 2.3 Shared / System

| # | Requirement | Evidence | Supabase Free Feasibility |
|---|-------------|----------|--------------------------|
| SR-01 | Role-based access (customer vs admin) | `src/types/auth.ts` (`Role = "customer" | "admin"`), `src/types/user.ts` | **FREE** — Supabase Auth custom claims + PostgreSQL RLS |
| SR-02 | KES currency throughout | `src/constants/config.ts`, `src/utils/currency.ts` | **FREE** — No external service needed |
| SR-03 | Kenyan phone number validation (+254 format) | `src/utils/validation.ts` | **FREE** — Client-side validation only |
| SR-04 | Image upload for products | `src/components/common/ImageUpload.tsx` | **FREE WITH USAGE CONSTRAINT** — Supabase Storage (1GB free) may limit image volume |
| SR-05 | Order status lifecycle | `src/types/order.ts` (`OrderStatus` union) | **FREE** — Enum or VARCHAR column in PostgreSQL |
| SR-06 | Return status lifecycle | `src/types/return.ts` (`ReturnStatus` union) | **FREE** — Enum or VARCHAR column |
| SR-07 | 24-hour order cycle | `src/constants/config.ts`, `src/types/deliveryCycle.ts` | **FREE WITH USAGE CONSTRAINT** — See delivery cycle discussion under FREE-TIER RISK |

---

## 3. Inherited Hibbullah Functionality

The following existed in Hibbullah and must be independently validated against Supabase Free constraints.

| # | Functionality | Status | Supabase Free Feasibility | Notes |
|---|---------------|--------|--------------------------|-------|
| IH-01 | Google login on welcome screen | Inherited, unverified | **FREE** — Supabase Auth supports Google OAuth natively | No extra cost; Google OAuth is free through Supabase Auth |
| IH-02 | Reset password flow | Inherited, unverified | **FREE** — Supabase Auth provides email-based password reset | Built-in, no extra service needed |
| IH-03 | User profile editing | Inherited | **FREE** — Standard PostgreSQL UPDATE with RLS | |
| IH-04 | Delivery cycle feature | Uncertain | **FREE WITH USAGE CONSTRAINT** | Requires scheduled job or server-side timer (FREE-TIER RISK — see below) |
| IH-05 | Audit log | Uncertain | **FREE** | Simple append-only table |
| IH-06 | Customer management by admin | Uncertain | **FREE WITH USAGE CONSTRAINT** | RLS must be carefully configured; PII exposure to admins is a product decision |
| IH-07 | Manufacturer browsing | Inherited | **FREE** | Read-only query |
| IH-08 | Product images (primary/secondary) | Inherited | **FREE WITH USAGE CONSTRAINT** | Supabase Storage 1GB free tier may be limiting for many product images |
| IH-09 | Discount system | Inherited | **FREE** | Simple arithmetic in PostgreSQL |
| IH-10 | Featured products | Inherited | **FREE** | Boolean flag on Product |

---

## 4. Assumptions

- **A-01**: The app is mobile-first (React Native / Expo). Web support may or may not be planned.
- **A-02**: Cash on Delivery is the intended initial (and possibly only) payment method. No other payment method exists in the codebase. COD requires no payment gateway integration, which is ideal for free-tier.
- **A-03**: The delivery model uses a 24-hour batch cycle where orders are grouped and delivered together. **FREE-TIER RISK**: Managing daily cycle boundaries requires scheduled logic.
- **A-04**: There are exactly two user roles: customer and admin. No intermediate roles are coded.
- **A-05**: Addresses are stored per-customer and can be labeled.
- **A-06**: The app is designed for the Kenyan market (KES currency, +254 phone format, Nairobi-centric example addresses).
- **A-07**: Product images are stored via Supabase Storage. The free 1GB limit must be monitored.
- **A-08**: The app does not currently implement any real authentication. Supabase Auth will be used for real authentication.
- **A-09**: No push notifications are planned (would require paid external service).

---

## 5. FREE-TIER RISK Items

These features are potentially useful but could exceed Supabase Free plan limits or require careful architecture to remain free.

| # | Item | Risk | Details |
|---|------|------|---------|
| FR-01 | **Delivery cycle automation** | MEDIUM | Managing 24-hour cycle boundaries requires scheduled logic. Supabase Free does not include cron jobs. Could use Supabase Edge Functions triggered manually or client-side checks. **FREE-TIER RISK**. |
| FR-02 | **Real-time notifications** | MEDIUM | Supabase Realtime is included free but has connection limits. For a small app, this is manageable, but real-time push delivery requires additional infrastructure. **FREE-TIER RISK**. |
| FR-03 | **Supabase Storage capacity (images)** | LOW-MEDIUM | Supabase Storage offers 1GB free. With product images, this could fill up depending on catalog size. Images should be optimized (small dimensions, compressed). **FREE-TIER RISK**. |
| FR-04 | **Database size (500MB)** | LOW | Supabase Free offers 500MB database. For a small pharmacy app, this is more than sufficient unless image BLOBs are stored in-database instead of Storage. **FREE-TIER RISK** if misused. |
| FR-05 | **Edge Functions for reports** | LOW | Aggregation queries on admin reports could be moved to Edge Functions, but the free tier has execution time limits. Simple queries can stay as direct DB calls. **FREE-TIER RISK** for complex aggregation. |
| FR-06 | **Row Level Security complexity** | LOW | RLS policies add no cost but require careful design. Complex multi-tenant policies could impact query performance on free-tier database limits. |
| FR-07 | **Email delivery for password reset** | LOW | Supabase Auth handles email delivery internally. For the free plan, delivery may be slower or less reliable than paid services, but functional for testing. |
| FR-08 | **Concurrent connections** | LOW | Supabase Free has connection limits. A small app with few concurrent users will not hit this. |

---

## 6. NOT SUITABLE Items

These features are impractical or impossible on the Supabase Free plan ($0).

| # | Item | Why NOT SUITABLE | Alternative |
|---|------|-----------------|-------------|
| NS-01 | **Push notifications** | Requires Firebase Cloud Messaging or similar paid service for reliable delivery. Supabase Realtime is client-connected only — no push when app is closed. | In-app notifications only. Use RLS-protected notification table. |
| NS-02 | **Background workers / scheduled jobs** | Supabase Free does not include cron jobs or background processing. Any scheduled task (e.g., closing delivery cycles) requires external infrastructure or client-side checks. | Client-side cycle detection on app open; manual admin override. |
| NS-03 | **Payment gateway integration (non-COD)** | Stripe, M-Pesa, and other payment providers require backend webhook handling and potentially paid tiers. COD avoids this entirely. | COD only for launch. Payment methods are post-MV2 additions. |
| NS-04 | **SMS notifications** | SMS services (Twilio, etc.) are paid. Not feasible at $0. | In-app notifications only. |
| NS-05 | **Large-scale realtime subscriptions** | Supabase Realtime has free-tier limits. A pharmacy with thousands of simultaneous admin dashboards could hit limits. | Use polling (infrequent) or client-side refresh on navigation for small scale. |
| NS-06 | **AI-powered features (search recommendations, etc.)** | External AI APIs (OpenAI, etc.) are paid. | Simple text search using PostgreSQL `ILIKE` or `pg_trgm`. |
| NS-07 | **CDN for image delivery** | Paid CDN services are not free. | Supabase Storage provides direct URLs. For a small app, this is acceptable. |
| NS-08 | **Advanced analytics / reporting engines** | External analytics services are paid. PostgreSQL aggregation queries are sufficient for a small app. | PostgreSQL `GROUP BY`, `COUNT`, `SUM` queries directly. |
| NS-09 | **Dedicated server processes** | Supabase Free is managed serverless — no dedicated server processes. All business logic must be in database queries or lightweight Edge Functions. | PostgreSQL functions and views. |
| NS-10 | **Multi-region deployment** | Supabase Free has a single region. Not suitable for global distribution. | Single-region (likely Africa/EU) is fine for Kenyan market. |

---

## 7. Supabase Free-Plan Architecture Principles

All architecture decisions must follow these principles:

1. **PostgreSQL is the primary database** — All domain data lives in PostgreSQL tables with Row Level Security (RLS).
2. **Supabase Auth handles all authentication** — No custom auth logic. Use email/password and/or Google OAuth through Supabase Auth.
3. **RLS enforces all data access boundaries** — Every table has RLS policies that restrict access based on the authenticated user's role and ownership.
4. **Supabase Storage handles file uploads** — Product images are stored in Supabase Storage buckets with RLS policies.
5. **No background processing** — Any scheduled task must be handled client-side or via manual admin action.
6. **No external paid services** — All functionality must work within Supabase free-tier capabilities.
7. **Simple queries, not complex stored procedures** — PostgreSQL functions should be lightweight. Complex logic belongs in the database schema with constraints and triggers.
8. **Edge Functions only when genuinely necessary** — For tasks that cannot be done in the database (e.g., external API calls), use lightweight Edge Functions. Avoid for routine operations.
9. **Offline-first is not a requirement** — The app assumes network connectivity. Caching is for UX, not offline operation.

---

## 8. Unresolved Decisions Required Before Backend Implementation

| # | Decision | Why It Matters | Options |
|---|----------|----------------|---------|
| UD-01 | Is Google OAuth required, or is email/password sufficient? | Determines auth provider architecture. Google OAuth is free through Supabase Auth. | Google OAuth / Email-password / Both |
| UD-02 | Is the delivery cycle a core feature or optional? | Affects database schema and requires scheduled logic (FREE-TIER RISK). | Required / Optional / Remove |
| UD-03 | Should admins view customer PII? | Affects RLS policy design. Admin access to customer data must be explicitly permitted or restricted. | Full access / Read-only / No access to PII |
| UD-04 | Are returns a launch requirement? | Returns add complexity to the workflow. Can be deferred to post-MV2 to simplify free-tier architecture. | Required / Post-MV2 / Remove |
| UD-05 | Are audit logs required at launch? | Audit logging adds a table but minimal complexity. Can be added post-MV2. | Required / Post-MV2 / Remove |
| UD-06 | Should manufacturers be navigable entities? | Affects database schema. Manufacturer as a table is simple; as metadata only is simpler. | Navigable entity / Metadata only |
| UD-07 | Is discount/promotional pricing core? | Affects Product table and pricing logic. | Core / Advanced / Remove |
| UD-08 | Are featured products core? | Affects Product table and admin UI. | Core / Admin feature / Remove |
| UD-09 | Image storage strategy? | Supabase Storage free tier (1GB) must be respected. | Supabase Storage / External CDN / TBD |
| UD-10 | Is there a plan for push notifications? | Would require paid service. Must be decided now to avoid false requirements. | Push (paid) / In-app only / Remove |
| UD-11 | Fixed or dynamic delivery fee? | Fixed fee is simpler and free-tier friendly. | Fixed (KSh 150) / Dynamic / Zone-based |
| UD-12 | Only COD or other payment methods? | COD requires no external integration. Other methods require paid services. | COD only / Add later / Multiple |

---

## 9. Documentation Legend

- **[CONFIRMED]** — Exists in the codebase as a working feature, screen, type, or navigation route.
- **[INHERITED]** — Exists from Hibbullah; requires product owner validation.
- **[ASSUMPTION]** — Inferred from code patterns, not confirmed by product documentation.
- **[UNRESOLVED]** — Must be decided before backend implementation begins.
- **[FREE]** — Fully supported on Supabase Free plan with no constraints.
- **[FREE-TIER RISK]** — Potentially usable on Supabase Free but requires careful architecture or may hit limits.
- **[NOT SUITABLE]** — Impractical or impossible on Supabase Free plan at $0.

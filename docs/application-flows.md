# Sifa-Pharma — Application Flows

> **Architecture Constraint**: All flows must work within Supabase Free-tier limits. No background workers, no external paid services, no real-time infrastructure beyond what Supabase Auth and Supabase Realtime provide for free.

---

## 1. Authentication Flow

### 1.1 New Customer Registration

```
Welcome Screen
    │
    ▼ [Sign up]
Registration Form (name, phone, email, password, confirmPassword)
    │
    ▼
Supabase Auth.signUp() — FREE
    │
    ▼
Verification email sent (Supabase Auth — FREE)
    │
    ▼ User verifies email
Session Created → Profile record inserted in profiles table
    │
    ▼ Redirect to Customer Home
```

**Supabase Free Feasibility**: **FREE** — Supabase Auth handles registration, email verification, and session management at no cost.

### 1.2 Returning Customer Login

```
Welcome Screen
    │
    ▼ [Login]
Login Form (email, password)
    │
    ▼
Supabase Auth.signInWithPassword() — FREE
    │
    ▼
Session Created → JWT returned
    │
    ▼ Redirect to Customer Home
```

**Supabase Free Feasibility**: **FREE** — Supabase Auth handles authentication.

### 1.3 Google OAuth Login

```
Welcome Screen
    │
    ▼ [Login with Google]
Supabase Auth.signInWithOAuth({ provider: 'google' }) — FREE
    │
    ▼ Google authentication
Session Created → Redirect to Customer Home
```

**Supabase Free Feasibility**: **FREE** — Google OAuth is supported natively by Supabase Auth at no cost.

### 1.4 Password Reset

```
Welcome Screen → Forgot Password
    │
    ▼ Enter Email
Supabase Auth.resetPasswordForEmail() — FREE
    │
    ▼ Reset link sent via email
    │
    ▼ Reset Password Screen → New Password
    │
    ▼ Supabase Auth.updateUser() — FREE
    │
    ▼ Password Updated → Redirect to Login
```

**Supabase Free Feasibility**: **FREE** — Supabase Auth handles password reset email delivery.

---

## 2. Customer Browsing Flow

### 2.1 Home → Search → Product Detail

```
Home Screen (Featured, Trending, New Arrivals)
    │
    ├── [Search bar] → Search Screen (ILIKE/pg_trgm query) → Product Detail
    │
    ├── [Tap product card] → Product Detail (SELECT by id)
    │
    └── [Browse categories] → Category Screen → Product List → Product Detail
```

**Supabase Free Feasibility**: **FREE** — Simple SELECT queries with pagination. Search via PostgreSQL `ILIKE` or `pg_trgm` extension (free).

### 2.2 Product Detail → Add to Cart

```
Product Detail Screen
    │
    ▼ [Select quantity]
    │
    ▼ [Add to Cart]
INSERT INTO cart_items — FREE
    │
    ▼ Cart Updated → Confirmation Feedback (local state)
    │
    ▼ [Continue Shopping OR View Cart]
```

**Supabase Free Feasibility**: **FREE** — INSERT into PostgreSQL cart_items table with RLS scoped to user.

---

## 3. Cart & Checkout Flow

### 3.1 Add to Cart → Checkout → Order

```
Browse Products → Add to Cart (×N)
    │
    ▼ [Open Cart]
Cart Summary Screen (computed from cart_items + products)
    │  (subtotal, discount, delivery fee, total — computed on read)
    ▼ [Proceed to Checkout]
Checkout Screen (address select, order summary, payment: COD)
    │
    ▼ [Submit Order]
BEGIN TRANSACTION — FREE
  │
  ├── Validate cart items and stock (SELECT + lock)
  ├── INSERT INTO orders (status: PENDING)
  ├── INSERT INTO order_items (snapshot of product data)
  ├── DELETE FROM cart_items (clear cart)
  └── COMMIT
    │
    ▼ Order Created → Delivery Cycle Updated → Order Confirmation
```

**Supabase Free Feasibility**: **FREE** — Transactional INSERT/DELETE in PostgreSQL. No external service needed. COD requires no payment gateway.

**FREE-TIER RISK**: If stock validation and order creation must happen atomically, a database function (stored procedure) should handle the entire transaction. This is lightweight and free.

---

## 4. Order Tracking Flow

### 4.1 Customer Views Order History

```
Customer Home → [Orders Tab] → Order List (SELECT where customerId)
    │
    ▼ [Tap an order] → Order Detail Screen
    │  (status, items, timeline, payment info, delivery address)
    │
    ▼ [If delivered and issue] → [Request Return] (if returns feature enabled)
```

**Supabase Free Feasibility**: **FREE** — SELECT with RLS ensuring customer sees only own orders.

---

## 5. Delivery Cycle Flow

### 5.1 Customer Views Active Delivery Cycle

```
Customer Home → [Delivery Cycle] → Cycle Summary
    │  (status: PENDING/APPROVED/CONFIRMED/DELIVERED/CANCELLED)
    │  (start time, close time, estimated total, products in cycle)
    │
    ▼ [Cycle closes → Orders processed → Delivery]
```

**FREE-TIER RISK**: The 24-hour cycle boundary requires scheduled logic. Supabase Free does not include cron jobs. Must be handled client-side (check on app open) or manually by admin. **FREE-TIER RISK**.

**Implementation approach**:
- `closesAt` computed on cycle creation (current time + 24 hours)
- Client checks `closesAt` on every app open
- If cycle expired, client prompts admin or auto-transitions based on product decision
- No background worker needed

---

## 6. Customer Account Management Flow

### 6.1 View and Edit Profile

```
Account Tab → Overview → Profile
    │  (view name, email, phone)
    │
    ▼ [Edit] → Edit Profile Form → UPDATE profiles — FREE
```

**Supabase Free Feasibility**: **FREE** — UPDATE on profiles table with RLS.

### 6.2 Manage Addresses

```
Account Tab → Overview → Addresses
    │  (list of saved addresses, filtered by RLS)
    │
    ▼ [Add Address] → INSERT addresses — FREE
    │
    ▼ [Edit Address] → UPDATE addresses — FREE
    │
    ▼ [Delete Address] — FREE
```

**Supabase Free Feasibility**: **FREE** — Standard CRUD with RLS scoped to userId.

### 6.3 Notifications and Settings

```
Account Tab → Overview → Notifications → SELECT notifications (own) — FREE
Account Tab → Overview → Settings → Toggle Preferences (if persisted) — FREE
```

**Supabase Free Feasibility**: **FREE** — SELECT/UPDATE on notifications table with RLS.

---

## 7. Admin Dashboard Flow

### 7.1 Admin Views Dashboard

```
Admin Login → Dashboard
    │
    ├── Key Statistics: Pending Orders, Processing, Low Stock, Active Products
    │   (SELECT COUNT(*) queries — FREE)
    ├── Needs Attention: Orders pending, Low-stock batches, Pending returns
    │   (SELECT with WHERE conditions — FREE)
    ├── Quick Actions: Add product, Manage orders, Inventory, Customers
    ├── Recent Orders (SELECT with pagination — FREE)
    ├── Inventory Snapshot (SELECT with WHERE — FREE)
    └── Recent Activity (SELECT from audit_entries — FREE)
```

**Supabase Free Feasibility**: **FREE** — Simple aggregate queries on small dataset. All queries use RLS to ensure admin access.

---

## 8. Admin Product Management Flow

### 8.1 Add or Edit Product

```
Admin Dashboard → [Products Tab] → Product List (SELECT — FREE)
    │
    ├── [Add Product] → Product Form → INSERT products — FREE
    │
    └── [Tap existing product] → Edit Product → UPDATE products — FREE
```

**Supabase Free Feasibility**: **FREE** — Standard CRUD with admin RLS. Images uploaded to Supabase Storage (1GB free).

**FREE-TIER RISK**: Image storage may consume the 1GB free tier as the catalog grows. Images should be optimized (small dimensions, compressed).

---

## 9. Admin Inventory Management Flow

### 9.1 View and Adjust Inventory

```
Admin Dashboard → [Inventory Tab] → Inventory Overview
    │
    ├── View all inventory items (SELECT — FREE)
    │
    ├── [View Batches] → Batch List (SELECT — FREE)
    │
    ├── [View Expiry] → Expiring batches (SELECT with expiryDate WHERE — FREE)
    │
    └── [Adjust Stock] → Stock Adjustment Form → INSERT stock_adjustments — FREE
                                                        → UPDATE inventory_items — FREE
```

**Supabase Free Feasibility**: **FREE** — All operations are standard SQL queries. Database triggers can handle inventory updates and audit logging.

---

## 10. Admin Order Management Flow

### 10.1 Review and Process Orders

```
Admin Dashboard → [Orders Tab] → Order List (SELECT all — FREE)
    │
    ├── [View Order] → Order Detail (SELECT — FREE)
    │
    ├── [Confirm Order] → UPDATE orders.status — FREE
    │
    ├── [Cancel Order] → UPDATE orders.status — FREE
    │
    └── [Mark as Delivered] → UPDATE orders.status — FREE
```

**Supabase Free Feasibility**: **FREE** — Simple UPDATE queries with RLS ensuring admin access.

---

## 11. Admin Return Management Flow

### 11.1 Review and Process Returns

```
Admin Dashboard → [Returns Tab] → Return Requests List (SELECT — FREE)
    │
    ├── [View Return] → Return Detail (SELECT — FREE)
    │
    ├── [Approve] → UPDATE return_requests.status — FREE
    │
    ├── [Reject] → UPDATE return_requests.status — FREE
    │
    └── [Process] → UPDATE return_requests.status — FREE
```

**FREE-TIER RISK**: Only relevant if returns is a launch feature (UD-04). If deferred to post-MV2, this flow is unnecessary at launch.

---

## 12. Admin Reports Flow

### 12.1 View Reports

```
Admin Dashboard → [Reports Tab] → Reports Overview
    │
    ├── Sales Report (SELECT COUNT, SUM, GROUP BY — FREE)
    │
    └── Inventory Report (SELECT COUNT, SUM, GROUP BY — FREE)
```

**Supabase Free Feasibility**: **FREE WITH USAGE CONSTRAINT** — Aggregation queries on small dataset are fine. No complex reporting engine needed. PostgreSQL `GROUP BY`, `COUNT`, `SUM` are sufficient. **FREE-TIER RISK** only if queries become very complex.

**Implementation approach**:
- Direct SQL queries from the client (with Supabase client library)
- Or use a lightweight Edge Function (free tier, execution time limits)
- For a small pharmacy, direct queries are sufficient

---

## 13. Customer Account Management Flow

### 13.1 View Customer Records

```
Admin Dashboard → [Customers Tab] → Customer List (SELECT — FREE)
    │
    ├── Search customers (ILIKE — FREE)
    │
    └── [Tap customer] → Customer Detail (SELECT — FREE)
```

**FREE-TIER RISK**: PII exposure depends on UD-03 decision. If admins should not see customer PII, this flow is unnecessary at launch.

**Supabase Free Feasibility**: **FREE** — Simple SELECT queries with RLS ensuring admin access.

---

## 14. Admin Audit Log Flow

### 14.1 View Operational Activity

```
Admin Dashboard → [Audit Tab] → Audit Log (SELECT from audit_entries — FREE)
    │  (filterable list of actions)
```

**Supabase Free Feasibility**: **FREE** — Simple SELECT on audit_entries table with admin RLS. Audit entries created automatically via database triggers.

---

## 15. Supabase Free-Feasibility Summary

| Flow | Supabase Free Feasibility | Notes |
|------|--------------------------|-------|
| Authentication | **FREE** | Supabase Auth covers all auth needs |
| Browsing | **FREE** | Simple SELECT queries |
| Cart | **FREE** | PostgreSQL cart_items table |
| Checkout | **FREE** | Transactional INSERT |
| Order tracking | **FREE** | SELECT with RLS |
| Delivery cycle | **FREE** (with FREE-TIER RISK on timing) | Client-side cycle checking |
| Account management | **FREE** | Standard CRUD |
| Product management | **FREE** (with FREE-TIER RISK on storage) | Supabase Storage 1GB limit |
| Inventory management | **FREE** | Standard SQL queries |
| Order management | **FREE** | UPDATE with RLS |
| Returns | **FREE** (conditional on UD-04) | Standard CRUD |
| Reports | **FREE** (with FREE-TIER RISK on complexity) | Simple PostgreSQL aggregation |
| Customer management | **FREE** (conditional on UD-03) | Standard SELECT with RLS |
| Audit log | **FREE** | INSERT-only log table |
| Notifications | **FREE** (with FREE-TIER RISK on real-time) | Polling or Supabase Realtime |

---

## 16. Flows NOT Suitable on Supabase Free

| Flow | Why NOT SUITABLE | Alternative |
|------|-----------------|-------------|
| Real-time order status push | Requires persistent WebSocket connections across all clients; Supabase Realtime free tier has connection limits | Client-side polling on screen focus |
| Automated delivery cycle closing | Requires cron job or background worker | Client-side check on app open |
| SMS order notifications | Requires paid SMS service | In-app notifications only |
| Push notifications | Requires Firebase/paid service | In-app notifications only |
| Payment processing (non-COD) | Requires paid payment gateway | COD only |
| AI-powered product recommendations | Requires paid AI API | Simple category-based browsing |

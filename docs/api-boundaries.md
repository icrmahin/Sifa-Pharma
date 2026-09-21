# Sifa-Pharma — API Boundaries

> **Architecture Constraint**: All API endpoints are implemented as Supabase PostgreSQL queries with Row Level Security (RLS). Authentication is handled by Supabase Auth. No external backend framework, no paid services. Simple Supabase client calls from the mobile app. Edge Functions only when genuinely necessary.

---

## 1. Authentication API

### 1.1 Resources

- **Sessions** (Supabase Auth manages sessions automatically)
- **Users** (`profiles` table linked to `auth.users`)

### 1.2 Conceptual Endpoints

Supabase Auth provides these natively. No custom endpoints needed.

| Operation | Supabase Auth Method | FREE? |
|-----------|---------------------|-------|
| Register | `supabase.auth.signUp()` | **FREE** |
| Login | `supabase.auth.signInWithPassword()` | **FREE** |
| Google OAuth | `supabase.auth.signInWithOAuth({ provider: 'google' })` | **FREE** |
| Password reset | `supabase.auth.resetPasswordForEmail()` | **FREE** |
| Logout | `supabase.auth.signOut()` | **FREE** |
| Session restore | Automatic (on app start) | **FREE** |
| Update profile | `supabase.auth.updateUser()` | **FREE** |

### 1.3 Additional User Profile Operations (via PostgreSQL)

| Operation | Table | Method | FREE? |
|-----------|-------|--------|-------|
| Get profile | `profiles` | `SELECT` | **FREE** |
| Update profile | `profiles` | `UPDATE` | **FREE** |
| Register profile | `profiles` | `INSERT` (after Auth signup) | **FREE** |

### 1.4 Request/Response Ownership

- **Client owns**: Sending credentials, storing the session token (Supabase Auth handles this automatically), sending the token with each database call via `Authorization` header.
- **Server owns**: Supabase Auth validates credentials, creates sessions, issues JWTs, manages token refresh. PostgreSQL handles profile data.

### 1.5 Authentication Boundary

- Supabase Auth handles all authentication. No custom auth logic needed.
- All database calls include the user's JWT via the Supabase client, which is automatically attached when the user is signed in.
- RLS policies use the `auth.uid()` function to enforce access control.

### 1.6 Authorization Boundary

- RLS policies restrict data access based on the authenticated user's role and ownership.
- The `auth.jwt()` function provides the user's role claim for RLS policy conditions.
- Admin-only tables (inventory, audit, etc.) have RLS policies that check `role = 'admin'`.

---

## 2. Products API

### 2.1 Resources

- **Products** (`products` table)
- **Categories** (`categories` table)
- **Manufacturers** (`manufacturers` table)

### 2.2 Conceptual Endpoints

All operations are standard Supabase PostgreSQL queries. No custom API server needed.

| Operation | Supabase Call | FREE? |
|-----------|--------------|-------|
| List products | `from('products').select().eq('isActive', true).order('createdAt', { ascending: false })` | **FREE** |
| Get product by ID | `from('products').select().eq('id', productId).single()` | **FREE** |
| Search products | `from('products').select().ilike('name', %query%)` (or pg_trgm) | **FREE** |
| Create product | `from('products').insert(productData)` — RLS: admin only | **FREE** |
| Update product | `from('products').update(data).eq('id', productId)` — RLS: admin only | **FREE** |
| Deactivate product | `from('products').update({ isActive: false }).eq('id', productId)` — RLS: admin only | **FREE** |
| List categories | `from('categories').select()` | **FREE** |
| List manufacturers | `from('manufacturers').select()` | **FREE** |
| Upload product image | `supabase.storage.from('product-images').upload(...)` | **FREE** (1GB storage limit) |
| Get product images | `supabase.storage.from('product-images').getPublicUrl(...)` | **FREE** |

### 2.3 Request/Response Ownership

- **Client owns**: Sending product form data, image files to Supabase Storage, search queries, filter parameters.
- **Server owns**: Supabase PostgreSQL validates data via constraints/triggers; RLS enforces admin-only writes; Supabase Storage handles file uploads.

### 2.4 Authentication Boundary

- GET `/products`, `/categories`, `/manufacturers`: Public (RLS allows anonymous read for active products).
- POST, PUT, DELETE: RLS restricts to admin role only.

### 2.5 Authorization Boundary

- Only admins can create, update, delete, or upload images for products/categories/manufacturers.
- Customers can only view active products.
- RLS policies use `auth.jwt() -> 'role'` to determine access level.

### 2.6 Validation Responsibility

- **PostgreSQL validates**: NOT NULL constraints, CHECK constraints, data types, foreign key constraints.
- **Trigger validates**: Additional business logic (e.g., stock must be non-negative, discount must be 0-99%).
- **Client validates**: Basic input format for UX feedback only.

---

## 3. Orders API

### 3.1 Resources

- **Orders** (`orders` table)
- **OrderItems** (`order_items` table)

### 3.2 Conceptual Endpoints

| Operation | Supabase Call | FREE? |
|-----------|--------------|-------|
| List orders (customer) | `from('orders').select().eq('customerId', userId)` — RLS | **FREE** |
| List orders (admin) | `from('orders').select()` — RLS | **FREE** |
| Get order by ID | `from('orders').select().eq('id', orderId)` — RLS | **FREE** |
| Create order | Database function with transaction: INSERT orders, INSERT order_items, DELETE cart_items | **FREE** |
| Update order status | `from('orders').update({ status }).eq('id', orderId)` — RLS: admin | **FREE** |
| Cancel order | `from('orders').update({ status: 'CANCELLED' }).eq('id', orderId)` — RLS | **FREE** |

### 3.3 Request/Response Ownership

- **Client owns**: Submitting order data (customer ID, address, payment method), requesting status changes (admin side).
- **Server owns**: Database function calculates order totals, creates order items, clears cart, enforces status transitions via constraints/functions.

### 3.3 Supabase-Specific Implementation

The order creation should use a PostgreSQL function to ensure atomicity:

```sql
CREATE OR REPLACE FUNCTION create_order(p_customer_id UUID, p_address TEXT)
RETURNS UUID AS $$
BEGIN
  -- Check cart
  -- Validate stock
  -- Calculate totals
  -- Insert order
  -- Insert order_items
  -- Clear cart
  -- Return order ID
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

This function runs server-side and is FREE on Supabase Free.

### 3.4 Authentication Boundary

- POST `/orders`: RLS ensures only the authenticated customer can create orders.
- GET `/orders/:id`: RLS ensures customer sees own orders; admins see all.
- PATCH `/orders/:id/status`: RLS ensures admin only.

---

## 4. Cart API

### 4.1 Resources

- **Cart** (`cart_items` table)

### 4.2 Conceptual Endpoints

| Operation | Supabase Call | FREE? |
|-----------|--------------|-------|
| Get cart | `from('cart_items').select().eq('userId', auth.uid())` | **FREE** |
| Add to cart | `from('cart_items').insert({ userId, productId, quantity })` | **FREE** |
| Update quantity | `from('cart_items').update({ quantity }).eq('id', itemId)` | **FREE** |
| Remove from cart | `from('cart_items').delete().eq('id', itemId)` | **FREE** |
| Clear cart | `from('cart_items').delete().eq('userId', auth.uid())` | **FREE** |
| Checkout | Database function: create order, clear cart | **FREE** |

### 4.3 Request/Response Ownership

- **Client owns**: Sending add/update/remove requests, calculating the local cart summary for display.
- **Server owns**: PostgreSQL validates stock and product existence; database function handles checkout atomically.

### 4.4 Authentication Boundary

- All cart endpoints use RLS scoped to `userId = auth.uid()`.
- A customer can only access their own cart.
- An admin cannot view or modify a customer's cart.

### 4.5 Validation Responsibility

- **PostgreSQL validates**: Stock sufficiency, product existence, quantity limits.
- **Trigger/function validates**: Maximum quantity per item, preventing duplicate entries (merge quantities).
- **Client validates**: Optimistic display; non-empty cart for checkout.

---

## 5. Inventory API

### 5.1 Resources

- **InventoryItems** (`inventory_items` table)
- **StockAdjustments** (`stock_adjustments` table)

### 5.2 Conceptual Endpoints

| Operation | Supabase Call | FREE? |
|-----------|--------------|-------|
| List inventory | `from('inventory_items').select()` — RLS: admin | **FREE** |
| Get batches | `from('inventory_items').select().order('expiryDate')` — RLS: admin | **FREE** |
| List expiring | `from('inventory_items').select().lt('expiryDate', now() + interval '60 days')` — RLS: admin | **FREE** |
| Record adjustment | `from('stock_adjustments').insert(...)` — RLS: admin → trigger updates inventory | **FREE** |
| List adjustments | `from('stock_adjustments').select()` — RLS: admin | **FREE** |

### 5.3 Request/Response Ownership

- **Client owns**: Sending adjustment requests, requesting inventory views.
- **Server owns**: Database triggers update `inventory_items.quantity` and `status` when `stock_adjustments` are inserted.

### 5.4 Authentication Boundary

- All inventory endpoints have RLS restricting to admin role.
- RLS policy: `auth.jwt() -> 'role' = 'admin'`.

---

## 6. Returns API

### 6.1 Resources

- **ReturnRequests** (`return_requests` table)

### 6.2 Conceptual Endpoints

| Operation | Supabase Call | FREE? |
|-----------|--------------|-------|
| List returns | `from('return_requests').select()` — RLS | **FREE** |
| Get return | `from('return_requests').select().eq('id', returnId)` — RLS | **FREE** |
| Create return | `from('return_requests').insert(...)` — RLS: customer | **FREE** |
| Update status | `from('return_requests').update({ status }).eq('id', returnId)` — RLS: admin | **FREE** |

### 6.3 Authentication Boundary

- Customers create returns for their own orders (RLS).
- Admins manage all returns (RLS).
- Status transitions enforced by database constraints or functions.

---

## 7. Delivery Cycles API

### 7.1 Resources

- **DeliveryCycles** (`delivery_cycles` table)

### 7.2 Conceptual Endpoints

| Operation | Supabase Call | FREE? |
|-----------|--------------|-------|
| Get active cycle | `from('delivery_cycles').select().eq('customerId', userId).eq('status', 'PENDING')` | **FREE** |
| Create cycle | `from('delivery_cycles').insert({ customerId, status: 'PENDING', startedAt, closesAt })` | **FREE** |
| Update status | `from('delivery_cycles').update({ status }).eq('id', cycleId)` | **FREE** |

### 7.3 FREE-TIER RISK: Cycle Timing (Mitigated 2026-09-22)

Automated cycle closing requires scheduled logic. Supabase Free does not include cron jobs.

**Free-tier approach (implemented)**:
- `closesAt` is computed at cycle creation (`src/services/deliveryCycle.ts:49` `now+24h`)
- Client checks `closesAt` on every app open / `useDeliveryCycle` focus
- Client detects expired cycles and prompts action
- `estimated_total` kept server-side via `sync_delivery_cycle_total()` trigger on `delivery_cycle_items` (`20260922140000`)
- No `pg_cron`/Edge Function needed — no background worker (verified `2026-09-22`)

---

## 8. Customers API

### 8.1 Resources

- **Customers** (`profiles` table filtered by role = 'customer')

### 8.2 Conceptual Endpoints

| Operation | Supabase Call | FREE? |
|-----------|--------------|-------|
| List customers (admin) | `from('profiles').select().eq('role', 'customer')` — RLS: admin | **FREE** |
| Get customer | `from('profiles').select().eq('id', customerId)` — RLS: admin | **FREE** |
| Get customer orders | `from('orders').select().eq('customerId', customerId)` — RLS: admin | **FREE** |

### 8.4 FREE-TIER RISK: PII Exposure

If admins should not see customer PII, this API is unnecessary at launch (UD-03 decision). RLS policies must be carefully configured.

---

## 9. Reports API

### 9.1 Resources

- **Reports** (computed aggregates, not stored entities)

### 9.2 Conceptual Endpoints

| Operation | Supabase Call | FREE? |
|-----------|--------------|-------|
| Sales summary | `from('orders').select('total').count().sum()` | **FREE** |
| Inventory summary | `from('inventory_items').select().count()` with WHERE conditions | **FREE** |
| Dashboard summary | Multiple simple COUNT/SUM queries | **FREE** |

### 9.3 FREE-TIER RISK: Complexity

For a small app, direct PostgreSQL aggregation queries are sufficient. No Edge Functions needed for reporting.

---

## 10. Audit API

### 10.1 Resources

- **AuditEntries** (`audit_entries` table)

### 10.2 Conceptual Endpoints

| Operation | Supabase Call | FREE? |
|-----------|--------------|-------|
| List audit entries | `from('audit_entries').select()` — RLS: admin | **FREE** |
| Search audit entries | `from('audit_entries').select().ilike('action', %query%)` — RLS: admin | **FREE** |

### 10.3 Authentication Boundary

- Admin only for all endpoints.
- Audit entries are created by database triggers (not by client calls).

---

## 11. Notifications API

### 11.1 Resources

- **Notifications** (`notifications` table)

### 11.2 Conceptual Endpoints

| Operation | Supabase Call | FREE? |
|-----------|--------------|-------|
| List notifications | `from('notifications').select().eq('userId', auth.uid())` | **FREE** |
| Mark as read | `from('notifications').update({ read: true }).eq('id', id)` | **FREE** |
| Mark all read | `from('notifications').update({ read: true }).eq('userId', auth.uid())` | **FREE** |
| Create notification | `from('notifications').insert(...)` — server-side (trigger/function) | **FREE** |

### 11.3 FREE-TIER RISK: Real-Time Delivery

Real-time notification delivery requires Supabase Realtime subscriptions (free-tier limited). For a small app, polling on screen focus is sufficient.

**Free-tier approach**:
- Query notifications when the customer opens the notifications screen
- Do not maintain a persistent Realtime subscription
- Optionally use Supabase Realtime for order status updates when the app is on the order screen

---

## 12. Supabase-Specific Implementation Notes

### 12.1 No Custom Server Needed

All API operations are implemented as:
1. **Direct Supabase client calls** from the mobile app to Supabase PostgreSQL
2. **PostgreSQL functions** for complex operations (e.g., order creation with transaction)
3. **Row Level Security policies** for access control
4. **Database triggers** for automated actions (e.g., audit logging, inventory status updates)

No Express.js, Fastify, or any other backend framework is needed. No Node.js server.

### 12.2 Row Level Security (RLS) Configuration

Every table must have RLS enabled with policies that:

- **Customers**: Can read/write own data (e.g., `auth.uid() = user_id`)
- **Admins**: Can read all data, write admin-only tables (e.g., `auth.jwt() -> 'role' = 'admin'`)
- **Public**: Can read public data (e.g., active products, categories)
- **Authenticated**: Can read data they own

Example RLS policy:
```sql
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (auth.jwt() -> 'role' = 'admin');
```

### 12.3 Edge Functions Usage (Minimal)

Edge Functions should only be used when:
- A task cannot be done in the database (e.g., external API call — but this contradicts $0 budget)
- For a small app, **almost nothing needs Edge Functions**
- Database functions and triggers handle all business logic

**FREE**: Supabase Edge Functions have a generous free tier, but they should be avoided where possible for simplicity.

### 12.4 Supabase Storage Configuration

- Create `product-images` bucket for product images
- Create `avatars` bucket for user avatars
- Set RLS policies on buckets (public read, authenticated write)
- Images are uploaded directly from the client to Supabase Storage
- Storage URLs are stored in the `products` and `profiles` tables as text
- **FREE**: 1GB storage limit, must be monitored

---

## 13. Summary of Supabase Free Feasibility by API Resource

| Resource | FREE? | Notes |
|----------|-------|-------|
| Auth (all operations) | **FREE** | Supabase Auth native |
| Products CRUD | **FREE** | PostgreSQL + RLS |
| Categories/Manufacturers CRUD | **FREE** | PostgreSQL + RLS |
| Product image upload | **FREE** (with 1GB limit) | Supabase Storage |
| Orders CRUD | **FREE** | PostgreSQL + RLS + database function |
| Cart CRUD | **FREE** | PostgreSQL + RLS |
| Inventory CRUD | **FREE** | PostgreSQL + RLS |
| Stock adjustments | **FREE** | PostgreSQL + RLS + trigger |
| Returns CRUD | **FREE** | PostgreSQL + RLS |
| Delivery cycles CRUD | **FREE** (timing is FREE-TIER RISK) | PostgreSQL + RLS |
| Customer management | **FREE** (PII is FREE-TIER RISK) | PostgreSQL + RLS |
| Reports | **FREE** | PostgreSQL aggregation queries |
| Audit log | **FREE** | PostgreSQL + trigger |
| Notifications CRUD | **FREE** (real-time is FREE-TIER RISK) | PostgreSQL + RLS |
| Address CRUD | **FREE** | PostgreSQL + RLS |
| Search | **FREE** | PostgreSQL ILIKE/pg_trgm |

---

## 14. Summary of Authorization Matrix

| Resource | Customer | Admin | Public |
|----------|----------|-------|--------|
| Auth (register, login) | ✓ | ✓ | ✓ |
| Auth (me, update) | Own profile | ✗ | ✗ |
| Products (read) | ✓ | ✓ | ✓ |
| Products (create/update/delete) | ✗ | ✓ | ✗ |
| Categories (read) | ✓ | ✓ | ✓ |
| Categories (write) | ✗ | ✓ | ✗ |
| Manufacturers (read) | ✓ | ✓ | ✓ |
| Manufacturers (write) | ✗ | ✓ | ✗ |
| Orders (create) | Own orders | ✗ | ✗ |
| Orders (read) | Own orders | All orders | ✗ |
| Orders (status update) | ✗ | ✓ | ✗ |
| Cart (all) | Own cart | ✗ | ✗ |
| Inventory (all) | ✗ | ✓ | ✗ |
| Returns (create) | Own returns | ✗ | ✗ |
| Returns (read) | Own returns | All returns | ✗ |
| Returns (status) | ✗ | ✓ | ✗ |
| Delivery Cycles (read) | Own cycles | All cycles | ✗ |
| Customers (read) | ✗ | ✓ | ✗ |
| Reports (all) | ✗ | ✓ | ✗ |
| Audit (all) | ✗ | ✓ | ✗ |
| Notifications (all) | Own notifications | ✗ | ✗ |

All access control is enforced by RLS policies using `auth.uid()` and `auth.jwt() -> 'role'`.

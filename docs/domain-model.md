# Sifa-Pharma — Domain Model

> **Architecture Constraint**: All domain entities must map to PostgreSQL tables with Row Level Security (RLS) on the Supabase Free plan. No database tables are defined here — only conceptual domain entities and their Supabase-compatible characteristics.

---

## 1. Entity Map

```
┌─────────┐     ┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  User   │────▶│  Order   │────▶│  OrderItem   │────▶│   Product   │
│         │     │          │     │              │     │             │
│         │     │          │     │              │     │  ──▶ Category
│         │     │          │     │              │     │  ──▶ Manufacturer
│         │     │          │     │              │     │  ──▶ Inventory
└─────────┘     └──────────┘     └──────────────┘     └─────────────┘
     │                  │                    │
     │                  │                    │
     ▼                  ▼                    ▼
┌─────────┐     ┌──────────┐     ┌──────────────┐
│Address  │     │   Cart   │     │DeliveryCycle │
│         │     │          │     │              │
└─────────┘     └──────────┘     └──────────────┘
```

---

## 2. User

**Purpose**: Represents a person using the application. A user can be either a customer or an admin. Authentication is handled entirely by Supabase Auth.

**Important Fields**:
- `id` — UUID, primary key, maps to Supabase Auth `auth.users.id`
- `name` — Full name (stored in `profiles` table, linked to `auth.users`)
- `email` — Email for Supabase Auth login
- `phone` — Kenyan phone number (+254...), required
- `role` — "customer" or "admin" (stored as custom claim or in profiles table)
- `avatar` — Optional profile image URL from Supabase Storage
- `createdAt` — Account creation timestamp

**Relationships**:
- One-to-many with `Order` (as customer)
- One-to-many with `Address`
- One-to-many with `DeliveryCycle` (as customer)
- One-to-one with `Cart` (profile-scoped)
- One-to-many with `ReturnRequest` (as customer)

**Ownership**: The user owns their profile data, addresses, orders, and cart. Admin users are identified by their `role` claim.

**Lifecycle**:
1. Registration via Supabase Auth (email/password or Google OAuth) — `auth.users` row created
2. Profile record created in `profiles` table
3. Active usage (browse, order, manage account)
4. Account can be deactivated (soft delete via `isActive` flag)

**Supabase Free Implementation**:
- Supabase Auth handles authentication (FREE)
- `profiles` table stores additional user data
- RLS policies restrict access to own profile
- Role stored as a custom claim in the JWT or a column in `profiles`

---

## 3. Product

**Purpose**: Represents a medicine or pharmaceutical product available for purchase.

**Important Fields**:
- `id` — UUID primary key
- `name` — Product name (e.g., "Paracetamol 500mg")
- `brand` — Brand name (e.g., "Panadol")
- `genericName` — Generic/active ingredient name
- `manufacturerId` — UUID reference to Manufacturer
- `categoryId` — UUID reference to Category
- `description` — Product summary shown to customers
- `price` — Current selling price in KES (numeric)
- `originalPrice` — Optional before-discount price
- `discountPercent` — Optional discount percentage (0-99)
- `stock` — Available quantity (integer)
- `unit` — Unit of sale (pack, bottle, tube, etc.)
- `imageUrl` — Primary image URL from Supabase Storage
- `secondaryImageUrl` — Optional secondary image URL
- `isActive` — Whether the product is visible to customers (boolean)
- `isFeatured` — Whether the product appears in featured sections (boolean)
- `createdAt` — When the product was added

**Relationships**:
- Many-to-one with `Category`
- Many-to-one with `Manufacturer`
- One-to-many with `OrderItem`
- One-to-many with `CartItem`

**Ownership**: Admin-owned. Only admins can create, edit, deactivate, or delete products. RLS policies restrict write access to admin role.

**Lifecycle**:
1. Created by admin (with category, manufacturer, pricing, stock)
2. Active → visible to customers
3. Inactive → hidden from catalog but retained in history
4. Stock can be adjusted by admin via inventory adjustments

**Supabase Free Implementation**:
- Standard PostgreSQL table
- RLS: Admins can write; customers can read active products
- Image URLs reference Supabase Storage objects (not stored in-database)
- Index on `categoryId`, `manufacturerId`, `isActive`, `isFeatured` for fast queries

---

## 4. Category

**Purpose**: Groups products into navigable categories for browsing.

**Important Fields**:
- `id` — UUID primary key
- `name` — Display name (e.g., "Pain Relief", "Antibiotics")
- `slug` — URL-friendly identifier
- `description` — Optional description
- `icon` — Optional display icon (emoji or short string)

**Relationships**:
- One-to-many with `Product`

**Ownership**: Admin-owned. Categories are managed by administrators.

**Lifecycle**:
1. Created by admin
2. Products assigned to category
3. Category can be renamed or deactivated
4. Products in a deactivated category may need reassignment

**Supabase Free Implementation**:
- Small lookup table (few rows)
- Read frequently, written rarely
- No RLS needed for read access (public browsing)
- Write access restricted to admin via RLS

---

## 5. Manufacturer

**Purpose**: Represents a pharmaceutical company that produces medicines.

**Important Fields**:
- `id` — UUID primary key
- `name` — Company name
- `country` — Country of origin
- `website` — Optional website URL

**Relationships**:
- One-to-many with `Product`

**Ownership**: Admin-owned. Manufacturers are managed by administrators.

**Lifecycle**:
1. Created or imported by admin
2. Products linked to manufacturer
3. Manufacturer info updated as needed
4. Manufacturer can be removed if no products reference it

**Supabase Free Implementation**:
- Small lookup table
- Standard CRUD with admin RLS

---

## 6. InventoryItem

**Purpose**: Tracks stock at the batch level for a specific product.

**Important Fields**:
- `id` — UUID primary key
- `productId` — UUID reference to Product
- `batchNumber` — Batch identifier (string)
- `quantity` — Available quantity in this batch (integer)
- `expiryDate` — When this batch expires (date)
- `status` — "healthy", "low", or "out_of_stock" (derived)
- `lastUpdated` — When this inventory record was last modified

**Relationships**:
- Many-to-one with `Product`

**Ownership**: Admin-owned. Only administrators can adjust inventory quantities.

**Lifecycle**:
1. Created when a batch arrives (or when a product is first added)
2. Status auto-calculated: `quantity <= 0` → `out_of_stock`, `quantity < lowStockThreshold` → `low`, otherwise `healthy`
3. Adjusted via stock adjustment records
4. Expiry dates monitored (60-day warning window)

**Business Rules**:
- Status is derived from quantity and the `lowStockThreshold` config (10 units)
- Expiry warnings trigger at `expiryWarningDays` (60 days from current date)
- Adjustments must have a reason recorded

**Supabase Free Implementation**:
- Standard PostgreSQL table
- RLS: Admin-only read/write
- Computed column or trigger for `status`
- Index on `expiryDate` for expiry queries
- Trigger on insert/update for status calculation

---

## 7. Order

**Purpose**: Represents a customer's purchase transaction.

**Important Fields**:
- `id` — UUID primary key
- `orderNumber` — Human-readable order number (e.g., "ORD-0001")
- `customerId` — UUID reference to User (customer)
- `customerName` — Denormalized customer name for display
- `createdAt` — Order placement timestamp
- `status` — Lifecycle status (see OrderStatus)
- `subtotal` — Subtotal before fees and discounts
- `discount` — Discount amount applied
- `deliveryFee` — Delivery fee (fixed KSh 150)
- `total` — Final amount paid
- `paymentMethod` — "CASH_ON_DELIVERY" (only method)
- `address` — Denormalized delivery address text
- `timeline` — Array of status history entries

**Relationships**:
- Many-to-one with `User` (as customer)
- One-to-many with `OrderItem`
- One-to-many with `ReturnRequest`

**Ownership**: Created by the customer. Managed by admin. Customer can view their own orders; admins can view all.

**Lifecycle**:
1. Created when customer submits checkout (status: `PENDING`)
2. Admin confirms order (status: `CONFIRMED`)
3. Admin processes order (status: `PROCESSING`)
4. Order dispatched (status: `OUT_FOR_DELIVERY`)
5. Order delivered (status: `DELIVERED`)
6. Or cancelled at any point before delivery (status: `CANCELLED`)
7. Or returned after delivery (status: `RETURNED`)

**OrderStatus Values**: `PENDING`, `CONFIRMED`, `PROCESSING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `RETURNED`

**Supabase Free Implementation**:
- Standard PostgreSQL table
- RLS: Customers read own orders; admins read all
- Order total computed server-side (never trusted from client)
- Status transition enforced by database constraints or function
- Index on `customerId`, `status`, `createdAt`

---

## 8. OrderItem

**Purpose**: Represents a single product within an order. Immutable snapshot of product data at time of order.

**Important Fields**:
- `id` — UUID primary key
- `orderId` — UUID reference to Order
- `productId` — UUID reference to Product
- `productName` — Denormalized product name at time of order
- `quantity` — Number of units ordered
- `unitPrice` — Price per unit at time of order
- `discountPercent` — Discount applied to this line item
- `total` — Line total

**Relationships**:
- Many-to-one with `Order`
- Many-to-one with `Product` (at time of order)

**Ownership**: Created by the system when an order is placed. Immutable after creation.

**Supabase Free Implementation**:
- Child table of Order
- RLS: Accessible via parent order access
- No updates after order creation (immutable snapshot)

---

## 9. Cart (CartItem)

**Purpose**: A temporary holding area for products a customer intends to purchase.

**Important Fields** (CartItem):
- `id` — UUID primary key
- `userId` — UUID reference to User
- `productId` — UUID reference to Product
- `quantity` — Quantity added to cart
- `createdAt` — When added to cart
- `updatedAt` — When quantity was last changed

**Cart-level fields**: Derived summary (subtotal, discount, deliveryFee, total) — computed on read, not stored.

**Relationships**:
- One-to-many with `CartItem` (scoped to a single User)
- Each CartItem references a `Product`

**Ownership**: The cart belongs to the currently authenticated customer. It is ephemeral.

**Lifecycle**:
1. Items added by the customer browsing products
2. Quantity adjusted by the customer
3. Items removed by the customer
4. Cart is emptied when an order is placed
5. Cart state can persist across sessions if stored in PostgreSQL (vs. in-memory)

**Important Decision**: Should the cart persist across sessions on Supabase? Storing cart in PostgreSQL is FREE and more reliable than in-memory state. This is recommended.

**Supabase Free Implementation**:
- PostgreSQL table with RLS scoped to `userId`
- Customer can only access their own cart
- Cart is automatically cleared when order is placed
- Trigger or function to prevent duplicate product entries (merge quantities)

---

## 10. DeliveryCycle

**Purpose**: Groups orders into a time-bound delivery batch (24-hour cycle).

**Important Fields**:
- `id` — UUID primary key
- `customerId` — UUID reference to User
- `status` — Lifecycle status
- `startedAt` — When the cycle opened
- `closesAt` — When the cycle closes
- `estimatedTotal` — Estimated total for the cycle

**Relationships**:
- Many-to-one with `User` (as customer)
- Implicitly linked to `Order` (orders placed within the cycle)

**Ownership**: Created for the customer. Managed by system timing.

**Lifecycle**:
1. Cycle starts automatically (daily at a set time)
2. Customer adds products during the cycle
3. Cycle closes at `closesAt`
4. Cycle is confirmed/processed by admin
5. Status transitions: `PENDING` → `APPROVED` → `CONFIRMED` → `DELIVERED` or `CANCELLED`

**DeliveryCycleStatus Values**: `PENDING`, `APPROVED`, `CONFIRMED`, `DELIVERED`, `CANCELLED`

**FREE-TIER RISK**: Automated cycle timing requires scheduled logic. Supabase Free does not include cron jobs. Must be handled client-side or manually.

**Supabase Free Implementation**:
- PostgreSQL table
- Client checks cycle status on app open
- RLS: Customer accesses own cycle; admin accesses all
- `closesAt` computed on creation (now + 24 hours)

---

## 11. Address

**Purpose**: Represents a delivery location for a customer.

**Important Fields**:
- `id` — UUID primary key
- `userId` — UUID reference to User
- `label` — Name for this address (e.g., "Home", "Office")
- `street` — Street address
- `city` — City
- `county` — Optional county (relevant for Kenya)
- `postalCode` — Optional postal code
- `isDefault` — Whether this is the default delivery address

**Relationships**:
- Many-to-one with `User` (as customer)

**Ownership**: The customer owns their addresses.

**Lifecycle**:
1. Created by the customer
2. Used at checkout for delivery
3. Customer can edit or delete addresses
4. One address can be marked as default

**Supabase Free Implementation**:
- Standard PostgreSQL table
- RLS: Customer can only access their own addresses
- Admin can view but not edit customer addresses (unless product decision says otherwise)

---

## 12. ReturnRequest

**Purpose**: Represents a customer's request to return a product from a delivered order.

**Important Fields**:
- `id` — UUID primary key
- `orderId` — UUID reference to Order
- `customerId` — UUID reference to User (customer)
- `customerName` — Denormalized for display
- `productName` — Denormalized product name
- `quantity` — Number of units being returned
- `reason` — Why the product is being returned
- `status` — Lifecycle status
- `createdAt` — When the return was requested

**Relationships**:
- Many-to-one with `Order`
- Many-to-one with `User` (as customer)

**Ownership**: Created by the customer. Reviewed and processed by admin.

**Lifecycle**:
1. Customer initiates return (status: `PENDING`)
2. Admin reviews and approves (status: `APPROVED`) or rejects (status: `REJECTED`)
3. If approved, admin processes the return (status: `PROCESSED`)

**ReturnStatus Values**: `PENDING`, `APPROVED`, `REJECTED`, `PROCESSED`

**Supabase Free Implementation**:
- Standard PostgreSQL table
- RLS: Customer creates and views own returns; admin manages all
- Status transitions enforced by database function or application logic

---

## 13. AuditEntry

**Purpose**: Records a change or action taken in the system for accountability.

**Important Fields**:
- `id` — UUID primary key
- `actorId` — UUID reference to User (actor)
- `action` — What was done (e.g., "Product created", "Order cancelled")
- `timestamp` — When the action occurred
- `recordType` — What type of record was affected
- `recordId` — ID of the affected record
- `oldValue` — Previous state (JSONB, optional)
- `newValue` — New state (JSONB, optional)

**Relationships**:
- Many-to-one with `User` (as actor)

**Ownership**: System-generated. Only the backend should create audit entries.

**Lifecycle**:
1. Created automatically when a significant action occurs (via database trigger or function)
2. Immutable after creation
3. Retained indefinitely (no automatic deletion on free tier)

**Supabase Free Implementation**:
- PostgreSQL table
- INSERT-only from client perspective; server/functions create entries
- RLS: Admin-only read access
- Consider partitioning or archiving if table grows large (unlikely for small app)

---

## 14. NotificationItem

**Purpose**: Represents an in-app notification for a user.

**Important Fields**:
- `id` — UUID primary key
- `userId` — UUID reference to User (recipient)
- `title` — Notification title
- `body` — Notification content
- `createdAt` — When the notification was created
- `read` — Whether the user has read it (boolean)
- `type` — "info", "success", "warning", or "alert"

**Relationships**:
- Many-to-one with `User` (as recipient)

**Ownership**: System-generated. Owned by the user who receives it.

**Lifecycle**:
1. Created by the system (e.g., order status change)
2. User views and marks as read
3. Persisted for the user to review at any time

**FREE-TIER RISK**: Real-time delivery of notifications requires Supabase Realtime connections. For a small app, this is manageable, but push delivery when app is closed is NOT possible on free tier.

**Supabase Free Implementation**:
- PostgreSQL table with RLS (user reads own notifications)
- Client polls or queries on screen focus
- Supabase Realtime optional for live updates
- Mark-as-read updates via UPDATE with RLS

---

## 15. StockAdjustment

**Purpose**: Records a change to inventory quantities.

**Important Fields**:
- `id` — UUID primary key
- `productId` — UUID reference to Product
- `batchNumber` — The batch being adjusted
- `type` — "increase" or "decrease"
- `quantity` — Amount adjusted (positive integer)
- `reason` — Why the adjustment was made
- `timestamp` — When the adjustment was made
- `adminId` — UUID reference to User (admin who made the adjustment)

**Relationships**:
- Many-to-one with `Product`
- Many-to-one with `User` (as admin actor)

**Ownership**: Created by admin only.

**Lifecycle**:
1. Admin initiates an adjustment from the inventory management screen
2. Adjustment is recorded with a reason
3. InventoryItem quantity is updated accordingly
4. Audit entry is created automatically

**Supabase Free Implementation**:
- Standard PostgreSQL table
- RLS: Admin-only read/write
- Trigger to update InventoryItem quantity on insert
- Audit entry created via trigger

---

## 16. Supabase-Specific Notes

| Entity | Supabase Table Name Convention | RLS Policy | Storage |
|--------|-------------------------------|------------|---------|
| User | `profiles` (linked to `auth.users`) | Users read/write own; admins read all | `avatars` bucket |
| Product | `products` | Admins write; all read active | `product-images` bucket |
| Category | `categories` | Public read; admin write | None |
| Manufacturer | `manufacturers` | Public read; admin write | None |
| InventoryItem | `inventory_items` | Admin only | None |
| Order | `orders` | Customer read/write own; admin read all | None |
| OrderItem | `order_items` | Via parent order access | None |
| CartItem | `cart_items` | Customer read/write own | None |
| DeliveryCycle | `delivery_cycles` | Customer read/write own; admin read all | None |
| Address | `addresses` | Customer read/write own | None |
| ReturnRequest | `return_requests` | Customer read/write own; admin read all | None |
| AuditEntry | `audit_entries` | Admin only | None |
| NotificationItem | `notifications` | Customer read/write own | None |
| StockAdjustment | `stock_adjustments` | Admin only | None |

---

## 17. Entity Relationship Summary

| Entity | Primary Key | Foreign Keys | Owned By | RLS Scope | Supabase Free Feasibility |
|--------|-------------|-------------|----------|-----------|--------------------------|
| User | id | auth.users.id | User | Own profile; admins all | **FREE** |
| Product | id | categoryId, manufacturerId | Admin | Admins write; all read active | **FREE** |
| Category | id | — | Admin | Public read; admin write | **FREE** |
| Manufacturer | id | — | Admin | Public read; admin write | **FREE** |
| Order | id | customerId | Customer/Admin | Own orders; admins all | **FREE** |
| OrderItem | id | productId, orderId | System | Via parent order | **FREE** |
| CartItem | id | productId, userId | Customer | Own cart | **FREE** |
| InventoryItem | id | productId | Admin | Admin only | **FREE** |
| DeliveryCycle | id | customerId | Customer | Own cycle; admins all | **FREE** (with FREE-TIER RISK on timing) |
| Address | id | userId | Customer | Own addresses | **FREE** |
| ReturnRequest | id | orderId, customerId | Customer | Own returns; admins all | **FREE** |
| AuditEntry | id | actorId | System | Admin only | **FREE** |
| NotificationItem | id | userId | System | Own notifications | **FREE** |
| StockAdjustment | id | productId, adminId | Admin | Admin only | **FREE** |

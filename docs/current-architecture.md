# Sifa-Pharma — Current Architecture

> **Architecture Constraint**: The backend is implemented entirely as **Supabase PostgreSQL + Supabase Auth + Supabase Storage + Row Level Security**. There is no separate server process. The mobile client calls Supabase directly. Free tier only ($0 budget).

---

## 1. Project Structure Overview

```
src/
├── app/                          # Expo Router pages/screens
│   ├── (auth)/                   # Auth screens (login, register, welcome, reset-password, forgot-password)
│   ├── (admin)/                  # Admin panel screens
│   ├── (customer)/               # Customer/Shop screens
│   │   ├── (tabs)/               # Main tab navigation (Home, Products, Orders, Cart, Account)
│   │   ├── search.tsx
│   │   ├── checkout.tsx
│   │   ├── delivery-cycle.tsx
│   │   ├── order/[orderId].tsx
│   │   ├── products/             # Product browsing (categories, manufacturers, product detail)
│   │   ├── address/              # Address management
│   │   └── account/              # Account settings (profile, settings, notifications, etc.)
├── providers/                    # React Context providers
│   ├── AppProviders.tsx          # Wraps AuthProvider > CartProvider > ThemeProvider
│   ├── AuthProvider.tsx          # Manages auth state (login, register, signOut)
│   ├── CartProvider.tsx          # Manages cart state (add, remove, update quantity)
│   └── ThemeProvider.tsx         # Manages light/dark theme with AsyncStorage persistence
├── components/                   # Shared and domain-specific components
│   ├── common/                   # Reusable UI components
│   ├── products/                 # Product-specific components
│   ├── cart/                     # Cart-specific components
│   └── admin/                    # Admin-specific components
├── hooks/                      # Data hooks (mostly placeholders for backend)
├── constants/                  # Design tokens and configuration
├── types/                      # TypeScript type definitions
└── lib/                        # Utility libraries
```

---

## 2. Theme System

- **File**: `src/providers/ThemeProvider.tsx`
- **Mechanism**: `useColorScheme()` from React Native + `AsyncStorage` for persistence
- **Theme modes**: `"light"`, `"dark"`, `"system"`
- **Color resolution**: `useThemeColors()` returns `darkColors` when `resolvedTheme === "dark"`, otherwise `colors` (light)
- **Key files using theme**: `Screen.tsx`, `Header.tsx`, `SearchBar`, `Input`, `Button`, `Toggle`, `Icon`, `Badge`, `Chip`, `Tabs`, `Alert`, `Card`, `ListItem`, `FilterChip`, `ProductCard`, `CartItem`, `OrderCard`, and all customer screens

---

## 3. State Management Architecture

### 3.1 Provider Hierarchy

```
AppProviders
├── AuthProvider       — User session, login, register, signOut
├── CartProvider       — Cart items, addItem, setQuantity, removeItem
└── ThemeProvider      — Theme mode, resolvedTheme, toggleTheme
```

### 3.2 CartProvider Functions (Backend Integration Points)

| Function | Current State | Supabase Backend Required |
|----------|---------------|--------------------------|
| `addItem(productId, quantity)` | Placeholder | INSERT into `cart_items` table |
| `setQuantity(itemId, quantity)` | Placeholder | UPDATE `cart_items` SET quantity |
| `removeItem(itemId)` | Placeholder | DELETE from `cart_items` |
| `items` | Hardcoded empty array | SELECT from `cart_items` WHERE user_id = current |
| `summary` | Hardcoded zeros | Computed from cart_items JOIN products |

### 3.3 AuthProvider Functions (Backend Integration Points)

| Function | Current State | Supabase Backend Required |
|----------|---------------|--------------------------|
| `login(form)` | Throws error | `supabase.auth.signInWithPassword()` |
| `register(form)` | Throws error | `supabase.auth.signUp()` |
| `signOut()` | Resets state | `supabase.auth.signOut()` |
| `refreshUser()` | No-op | Fetch user profile from `profiles` table |
| `session` | Dev default | `supabase.auth.getSession()` |

---

## 4. All Backend Integration Functions

### 4.1 Authentication (Supabase Auth + PostgreSQL)

#### `supabase.auth.signUp(email, password, phone, name)`
- **Purpose**: Register a new customer
- **Supabase Method**: `supabase.auth.signUp()`
- **Tables needed**: `auth.users`, `profiles`
- **RLS**: Profiles table must have RLS policy allowing INSERT for authenticated users

#### `supabase.auth.signInWithPassword(email, password)`
- **Purpose**: Customer login
- **Supabase Method**: `supabase.auth.signInWithPassword()`
- **Returns**: Session with JWT tokens

#### `supabase.auth.signOut()`
- **Purpose**: Logout
- **Supabase Method**: `supabase.auth.signOut()`
- **Called from**: `AuthProvider.signOut()`, AccountScreen logout button

#### `supabase.auth.resetPasswordForEmail(email)`
- **Purpose**: Send password reset email
- **Supabase Method**: `supabase.auth.resetPasswordForEmail()`
- **Called from**: ForgotPasswordScreen

#### `supabase.auth.updateUser()`
- **Purpose**: Update profile (name, phone, email)
- **Supabase Method**: `supabase.auth.updateUser()`
- **Called from**: ProfileScreen Save button

#### `supabase.from('profiles').select().eq('id', userId)`
- **Purpose**: Fetch user profile data after login
- **Table**: `profiles`
- **Columns**: `id`, `name`, `email`, `phone`, `role`, `avatar_url`, `created_at`
- **RLS**: Users can only SELECT their own profile

#### `supabase.from('profiles').update(...).eq('id', userId)`
- **Purpose**: Update user profile
- **Table**: `profiles`
- **RLS**: Users can only UPDATE their own profile

---

### 4.2 Products (Supabase PostgreSQL)

#### `supabase.from('products').select()`
- **Purpose**: Fetch all products for browsing
- **Table**: `products`
- **Columns**: `id`, `name`, `brand`, `generic_name`, `manufacturer_id`, `category_id`, `description`, `price`, `original_price`, `discount_percent`, `stock`, `unit`, `image_url`, `is_active`, `is_featured`, `batch_number`, `expiry_date`, `created_at`
- **RLS**: Public read (or customer-scoped)
- **Called from**: `ProductHeroSlider`, `ProductCard`, `ProductList`, category/product listing screens

#### `supabase.from('products').select().eq('category_id', categoryId)`
- **Purpose**: Filter products by category
- **Called from**: `CategoryProductsScreen`, category filter chips

#### `supabase.from('products').select().eq('manufacturer_id', manufacturerId)`
- **Purpose**: Filter products by manufacturer
- **Called from**: `ManufacturerProductsScreen`

#### `supabase.from('products').select().ilike('name', %query%)` (or `text.search`)
- **Purpose**: Search products by name, brand, generic name, description
- **Called from**: `SearchBar`, `CustomerSearchScreen`
- **Supabase feature**: `pg_trgm` extension or `text.search` for full-text search

#### `supabase.from('products').select().eq('id', productId).single()`
- **Purpose**: Fetch single product detail
- **Called from**: `ProductDetailScreen`
- **Also includes**: `manufacturer` JOIN, `category` JOIN, `inventory` JOIN

#### `supabase.from('products').select().eq('is_active', true)`
- **Purpose**: Only show active products
- **Filter**: `is_active = true`
- **Called from**: All product listing screens

#### `supabase.from('products').select().in('id', [ids])`
- **Purpose**: Batch fetch products (for cart item display)
- **Called from**: `CartItemRow`, `OrderCard`, `CartSummary`

---

### 4.3 Categories (Supabase PostgreSQL)

#### `supabase.from('categories').select()`
- **Purpose**: Fetch all categories for browsing
- **Table**: `categories`
- **Columns**: `id`, `name`, `slug`, `description`, `icon`, `is_active`
- **RLS**: Public read
- **Called from**: `CategoriesScreen`, `ProductCard` category display

---

### 4.4 Manufacturers (Supabase PostgreSQL)

#### `supabase.from('manufacturers').select()`
- **Purpose**: Fetch all manufacturers for browsing
- **Table**: `manufacturers`
- **Columns**: `id`, `name`, `country`, `website`, `is_active`
- **RLS**: Public read
- **Called from**: `ManufacturersScreen`, `ManufacturerCard`

---

### 4.5 Cart (Supabase PostgreSQL)

#### `supabase.from('cart_items').select().eq('user_id', userId)`
- **Purpose**: Load cart items for current user
- **Table**: `cart_items`
- **Columns**: `id`, `user_id`, `product_id`, `quantity`, `created_at`, `updated_at`
- **RLS**: User can only SELECT their own cart items
- **Called from**: `CartProvider`, `CartScreen`, `CartSummary`

#### `supabase.from('cart_items').insert({ user_id, product_id, quantity })`
- **Purpose**: Add item to cart
- **RLS**: User can only INSERT for their own user_id
- **Called from**: `ProductDetailScreen` Add to Cart button, `ProductCard` onPress

#### `supabase.from('cart_items').update({ quantity }).eq('id', itemId).eq('user_id', userId)`
- **Purpose**: Update cart item quantity
- **RLS**: User can only UPDATE their own cart items
- **Called from**: `QuantitySelector`, `CartItemRow`

#### `supabase.from('cart_items').delete().eq('id', itemId).eq('user_id', userId)`
- **Purpose**: Remove item from cart
- **RLS**: User can only DELETE their own cart items
- **Called from**: `CartItemRow` remove button, `CartScreen`

#### `supabase.from('cart_items').delete().eq('user_id', userId)`
- **Purpose**: Clear cart after checkout
- **Called from**: `CheckoutScreen` after successful order

---

### 4.6 Orders (Supabase PostgreSQL)

#### `supabase.from('orders').select().eq('customer_id', userId)`
- **Purpose**: Load all orders for current user
- **Table**: `orders`
- **Columns**: `id`, `order_number`, `customer_id`, `subtotal`, `discount`, `delivery_fee`, `total`, `payment_method`, `status`, `address`, `created_at`, `updated_at`
- **RLS**: Customer can only SELECT their own orders
- **Called from**: `CustomerOrdersScreen`, `OrderCard`

#### `supabase.from('orders').select().eq('id', orderId).single()`
- **Purpose**: Load single order detail with timeline
- **Includes**: `order_items` JOIN, `order_timeline` JOIN
- **Called from**: `OrderDetailScreen`

#### `supabase.from('orders').insert({ order_number, customer_id, subtotal, discount, delivery_fee, total, payment_method, status, address })`
- **Purpose**: Create new order (checkout)
- **Must use**: Database function or trigger to generate `order_number`
- **RLS**: User can only INSERT for their own user_id
- **Called from**: `CheckoutScreen` Submit Order button

#### `supabase.from('order_items').insert({ order_id, product_id, quantity, unit_price, discount_percent, total })`
- **Purpose**: Insert order items when creating an order
- **Table**: `order_items`
- **Must be in transaction**: Along with order INSERT
- **Called from**: `CheckoutScreen` after order creation

#### `supabase.from('orders').update({ status }).eq('id', orderId)`
- **Purpose**: Update order status (e.g., after payment confirmation, delivery)
- **Called from**: Admin panel, order tracking

---

### 4.7 Order Timeline (Supabase PostgreSQL)

#### `supabase.from('order_timeline').select().eq('order_id', orderId)`
- **Purpose**: Load all status updates for an order
- **Table**: `order_timeline`
- **Columns**: `id`, `order_id`, `label`, `note`, `created_at`
- **RLS**: Customer can only SELECT orders they own
- **Called from**: `OrderDetailScreen` timeline view

#### `supabase.from('order_timeline').insert({ order_id, label, note })`
- **Purpose**: Add a new status update to an order
- **Called from**: Admin panel when updating order status, automatic via trigger

---

### 4.8 Addresses (Supabase PostgreSQL)

#### `supabase.from('addresses').select().eq('user_id', userId)`
- **Purpose**: Load all addresses for current user
- **Table**: `addresses`
- **Columns**: `id`, `user_id`, `label`, `street`, `city`, `county`, `postal_code`, `is_default`
- **RLS**: User can only SELECT their own addresses
- **Called from**: `AddressesScreen`, `AddressEditScreen`

#### `supabase.from('addresses').insert({ user_id, label, street, city, county, postal_code, is_default })`
- **Purpose**: Add a new address
- **RLS**: User can only INSERT for their own user_id
- **Called from**: `AddressEditScreen` Add button

#### `supabase.from('addresses').update({ ... }).eq('id', addressId).eq('user_id', userId)`
- **Purpose**: Update existing address
- **RLS**: User can only UPDATE their own addresses
- **Called from**: `AddressEditScreen` Save button

#### `supabase.from('addresses').delete().eq('id', addressId).eq('user_id', userId)`
- **Purpose**: Delete an address
- **RLS**: User can only DELETE their own addresses
- **Called from**: `AddressesScreen` delete action

---

### 4.9 Delivery Cycles (Supabase PostgreSQL)

#### `supabase.from('delivery_cycles').select().eq('customer_id', userId)`
- **Purpose**: Load current delivery cycle for user
- **Table**: `delivery_cycles`
- **Columns**: `id`, `customer_id`, `status`, `started_at`, `closes_at`, `estimated_total`
- **RLS**: Customer can only SELECT their own cycles
- **Called from**: `DeliveryCycleScreen`

#### `supabase.from('delivery_cycle_items').select().eq('delivery_cycle_id', cycleId)`
- **Purpose**: Load products in a delivery cycle
- **Table**: `delivery_cycle_items`
- **Columns**: `id`, `delivery_cycle_id`, `product_id`, `quantity`
- **RLS**: Customer can only SELECT their own cycle items
- **Called from**: `DeliveryCycleScreen` product list

#### `supabase.from('delivery_cycles').insert({ customer_id, status, started_at, closes_at })`
- **Purpose**: Create new delivery cycle
- **Called from**: Auto-generated by system when order is placed, or admin

---

### 4.10 Notifications (Supabase PostgreSQL + Supabase Realtime)

#### `supabase.from('notifications').select().eq('user_id', userId)`
- **Purpose**: Load all notifications for current user
- **Table**: `notifications`
- **Columns**: `id`, `user_id`, `title`, `body`, `type`, `is_read`, `created_at`
- **RLS**: User can only SELECT their own notifications
- **Called from**: `NotificationsScreen`

#### `supabase.from('notifications').update({ is_read: true }).eq('id', notificationId).eq('user_id', userId)`
- **Purpose**: Mark notification as read
- **Called from**: `NotificationsScreen` on press

#### `supabase.realtime.channel('notifications').subscribe()`
- **Purpose**: Real-time notification delivery
- **Supabase Feature**: Supabase Realtime
- **FREE-TIER RISK**: Realtime subscriptions may have limits on free plan
- **Called from**: `NotificationsScreen`, `NotificationBadge`

---

### 4.11 Returns (Supabase PostgreSQL)

#### `supabase.from('return_requests').select().eq('customer_id', userId)`
- **Purpose**: Load return requests for current user
- **Table**: `return_requests`
- **Columns**: `id`, `order_id`, `customer_id`, `product_name`, `quantity`, `reason`, `status`, `created_at`
- **RLS**: Customer can only SELECT their own returns
- **Called from**: Order detail screen (future feature)

#### `supabase.from('return_requests').insert({ order_id, customer_id, product_name, quantity, reason })`
- **Purpose**: Create a return request
- **RLS**: User can only INSERT for their own orders
- **Called from**: Order detail screen (future feature)

---

### 4.12 Inventory (Supabase PostgreSQL — Admin Only)

#### `supabase.from('inventory').select().eq('product_id', productId)`
- **Purpose**: Check inventory status for a product
- **Table**: `inventory`
- **Columns**: `id`, `product_id`, `batch_number`, `quantity`, `expiry_date`, `status`, `last_updated`
- **RLS**: Admin only (via Supabase Auth `role` claim)
- **Called from**: Admin product detail, inventory management

#### `supabase.from('inventory').update({ quantity, status }).eq('id', inventoryId)`
- **Purpose**: Adjust inventory stock
- **Called from**: Admin stock management

#### `supabase.from('inventory_adjustments').insert({ ... })`
- **Purpose**: Log inventory changes
- **Table**: `inventory_adjustments`
- **Columns**: `id`, `product_id`, `batch_number`, `type` (increase/decrease), `quantity`, `reason`, `admin_id`, `timestamp`
- **Called from**: Admin when adjusting stock

---

### 4.13 Storage (Supabase Storage)

#### `supabase.storage.from('product-images').upload(file, path)`
- **Purpose**: Upload product images
- **Bucket**: `product-images`
- **Called from**: Admin `ProductForm` image upload, `ImageUpload` component

#### `supabase.storage.from('product-images').getPublicUrl(path)`
- **Purpose**: Get public URL for product image
- **Called from**: `ProductImage`, `ProductCard`, all product displays

#### `supabase.storage.from('avatars').upload(file, path)`
- **Purpose**: Upload user avatar
- **Bucket**: `avatars`
- **Called from**: ProfileScreen avatar upload

#### `supabase.storage.from('avatars').getPublicUrl(path)`
- **Purpose**: Get public URL for user avatar
- **Called from**: `AppLogo` variant="white" (admin), profile avatar display

---

## 5. Product-Specific Data Hooks (Backend Integration Points)

### 5.1 `useProducts(filters)` — `src/hooks/useProducts.ts`
- **Currently**: Placeholder returning empty array
- **Backend**: `supabase.from('products').select(filters)`
- **Needed**: Pagination, search by name/brand/generic, filter by category, manufacturer, stock status, sort by price/name/discount

### 5.2 `useProduct(productId)` — `src/hooks/useProduct.ts`
- **Currently**: Placeholder returning undefined
- **Backend**: `supabase.from('products').select().eq('id', productId).single()` with JOINs for manufacturer, category, inventory

### 5.3 `useOrders()` — `src/hooks/useOrders.ts`
- **Currently**: Placeholder returning empty array
- **Backend**: `supabase.from('orders').select().eq('customer_id', userId)`
- **Needed**: Pagination, status filtering, sort by date

### 5.4 `useDeliveryCycle()` — `src/hooks/useDeliveryCycle.ts`
- **Currently**: Placeholder returning null
- **Backend**: `supabase.from('delivery_cycles').select().eq('customer_id', userId)`
- **Needed**: Fetch current active cycle, associated products

### 5.5 `useNotifications()` — `src/hooks/useNotifications.ts`
- **Currently**: Placeholder returning empty array
- **Backend**: `supabase.from('notifications').select().eq('user_id', userId).order('created_at', { ascending: false })`
- **Needed**: Real-time subscription via Supabase Realtime

---

## 6. Cart Data Flow (Backend Integration Points)

```
ProductDetailScreen [Add to Cart]
    │
    ▼
CartProvider.addItem(productId, quantity)
    │
    ▼
supabase.from('cart_items').insert({ user_id, product_id, quantity })
    │
    ▼
CartProvider.refresh() → supabase.from('cart_items').select().eq('user_id')
    │
    ▼
Cart item count updates across all screens via CartProvider context
```

---

## 7. Checkout Flow (Backend Integration Points)

```
CartScreen [Proceed to Checkout]
    │
    ▼
CheckoutScreen
    │
    ├── Validate address (supabase.from('addresses').select())
    │
    ├── Create order: supabase.from('orders').insert({ ... })
    │
    ├── Create order items: supabase.from('order_items').insert({ ... })
    │
    ├── Clear cart: supabase.from('cart_items').delete().eq('user_id')
    │
    ├── Create delivery cycle (if new): supabase.from('delivery_cycles').insert({ ... })
    │
    └── Add order timeline entry: supabase.from('order_timeline').insert({ ... })
    │
    ▼
DeliveryCycleScreen [Order tracking]
```

---

## 8. All Supabase Tables Required

| Table | Purpose | RLS Policy |
|-------|---------|------------|
| `auth.users` | User accounts (managed by Supabase Auth) | Automatic |
| `profiles` | Extended user profile (name, phone, role, avatar) | User reads/updates own |
| `products` | Product catalog | Public read, Admin write |
| `categories` | Product categories | Public read, Admin write |
| `manufacturers` | Product manufacturers | Public read, Admin write |
| `cart_items` | Shopping cart items | User CRUD own |
| `orders` | Customer orders | User reads own, Admin manages all |
| `order_items` | Individual items within an order | User reads own, Admin manages all |
| `order_timeline` | Order status history | User reads own, Admin manages all |
| `addresses` | User delivery addresses | User CRUD own |
| `delivery_cycles` | Order delivery cycles | Customer reads own, Admin manages all |
| `delivery_cycle_items` | Products in a delivery cycle | Customer reads own, Admin manages all |
| `notifications` | User notifications | User reads/updates own |
| `inventory` | Product inventory/stock | Admin only |
| `inventory_adjustments` | Inventory change audit log | Admin only |
| `return_requests` | Product return requests | User CRUD own |
| `reviews` | Product reviews (future) | User CRUD own |

---

## 9. Free-Tier Constraints & Risks

| Concern | Risk Level | Mitigation |
|---------|-----------|------------|
| Supabase Realtime subscriptions | Medium | Use sparingly; notifications only |
| Database function calls | Low | Free plan allows reasonable usage |
| Storage bandwidth | Low | Product images are small |
| Row Level Security complexity | Medium | Must test thoroughly; RLS errors break UI |
| Connection limits | Low | Mobile app has fewer concurrent connections |
| Scheduled jobs (delivery cycle) | High | No built-in cron on free plan; use Edge Function + Supabase pg_cron or client-side check |
| Real-time inventory updates | Medium | Polling instead of Realtime acceptable |

---

## 10. Key Configuration Values

| Value | Source | Usage |
|-------|--------|-------|
| `deliveryFee: 150` | `src/constants/config.ts` | Checkout calculation |
| `orderCycleHours: 24` | `src/constants/config.ts` | Delivery cycle duration |
| `lowStockThreshold: 10` | `src/constants/config.ts` | Inventory status |
| `expiryWarningDays: 60` | `src/constants/config.ts` | Inventory expiry warnings |
| `defaultPageSize: 20` | `src/constants/config.ts` | Pagination |
| `currency: "KES"` | `src/constants/config.ts` | Currency display |
| `supportEmail: "support@sifa-pharma.com"` | `src/constants/config.ts` | Contact support |

---

## 11. Admin Panel Backend Integration Points

The admin panel (`src/app/(admin)/`) requires additional backend access:

### Admin-Only Functions

| Function | Backend Call | Table |
|----------|-------------|-------|
| View all orders | `supabase.from('orders').select()` | `orders` |
| Update order status | `supabase.from('orders').update()` | `orders` |
| Manage products (CRUD) | `supabase.from('products').insert/update/delete` | `products` |
| Manage inventory | `supabase.from('inventory').select/update` | `inventory` |
| View all customers | `supabase.from('profiles').select()` | `profiles` |
| Manage returns | `supabase.from('return_requests').select/update` | `return_requests` |
| View audit logs | `supabase.from('audit_logs').select()` | `audit_logs` |
| Upload product images | `supabase.storage.from('product-images').upload` | Storage |
| Manage categories | `supabase.from('categories').insert/update/delete` | `categories` |
| Manage manufacturers | `supabase.from('manufacturers').insert/update/delete` | `manufacturers` |

---

## 12. Navigation Structure

```
App
├── (auth)
│   ├── welcome.tsx           — Landing/Welcome screen
│   ├── login.tsx             — Login screen
│   ├── register.tsx          — Registration screen
│   ├── forgot-password.tsx   — Forgot password
│   └── reset-password.tsx    — Reset password
├── (customer)
│   ├── (tabs)/               — Main tab navigation
│   │   ├── index.tsx         — Home screen (product grid, hero slider, categories)
│   │   ├── products.tsx      — Product browsing with filters
│   │   ├── cart.tsx          — Shopping cart
│   │   ├── orders.tsx        — Order history
│   │   └── account.tsx       — Account settings
│   ├── search.tsx            — Search results
│   ├── checkout.tsx          — Checkout
│   ├── delivery-cycle.tsx    — Delivery cycle tracking
│   ├── order/[orderId].tsx   — Order detail
│   ├── products/             — Product browsing sub-screens
│   │   ├── categories.tsx
│   │   ├── category/[categoryId].tsx
│   │   ├── manufacturers.tsx
│   │   ├── manufacturer/[manufacturerId].tsx
│   │   └── [productId].tsx   — Product detail
│   ├── address/
│   │   ├── _layout.tsx
│   │   └── edit.tsx          — Add/edit address
│   └── account/              — Account sub-screens
│       ├── overview.tsx      — Account dashboard
│       ├── profile.tsx       — Profile management
│       ├── settings.tsx      — Settings (dark mode toggle)
│       ├── notifications.tsx — Notifications list
│       ├── addresses.tsx     — Address list
│       └── _layout.tsx
├── (admin)                   — Admin panel
│   └── ...                   — Admin dashboard, product management, order management
└── _layout.tsx               — Root layout with ThemeProvider, StatusBar
```

---

## 13. Component Architecture

### 13.1 Theme-Aware Component Pattern

All customer-facing components follow this pattern:
```tsx
const colors = useThemeColors();  // Returns darkColors or colors (light)
```

Components that are NOT yet theme-aware still use `import colors from "../../constants/colors"` which always returns light colors. These were fixed in this session.

### 13.2 Component Categories

| Category | Components | Backend Data Needed |
|----------|-----------|-------------------|
| **Auth** | LoginForm, RegisterForm | `supabase.auth.signInWithPassword()`, `supabase.auth.signUp()` |
| **Product Display** | ProductCard, ProductPrice, ProductImage, DiscountBadge, ProductHeroSlider | `supabase.from('products').select()` |
| **Category/Manufacturer** | CategoryCard, ManufacturerCard, FilterChip | `supabase.from('categories').select()`, `supabase.from('manufacturers').select()` |
| **Cart** | CartItemRow, QuantitySelector, CartSummary | `supabase.from('cart_items').select/insert/update/delete` |
| **Order** | OrderCard, OrderStatus, OrderSummary | `supabase.from('orders').select()`, `supabase.from('order_items').select()` |
| **Address** | AddressList, AddressForm | `supabase.from('addresses').select/insert/update/delete` |
| **Notification** | NotificationItem | `supabase.from('notifications').select()` + Realtime |
| **Delivery** | DeliveryCycleView | `supabase.from('delivery_cycles').select()` |
| **Common UI** | Button, Input, Header, SearchBar, Card, Badge, Chip, Toggle, Alert, Text, Icon, Modal, Screen | None (purely presentational with theme colors) |

---

## 14. Supabase Client Integration Points Summary

All backend functions that need to be connected are summarized below:

### Authentication Functions
1. `supabase.auth.signUp({ email, password, phone, name })` — `AuthProvider.register()`
2. `supabase.auth.signInWithPassword({ email, password })` — `AuthProvider.login()`
3. `supabase.auth.signOut()` — `AuthProvider.signOut()`
4. `supabase.auth.resetPasswordForEmail(email)` — `ForgotPasswordScreen`
5. `supabase.auth.updateUser({ ... })` — `ProfileScreen`
6. `supabase.auth.getSession()` — `AuthProvider` on app start
7. `supabase.auth.onAuthStateChange()` — Session listener in `AuthProvider`

### Products Functions
8. `supabase.from('products').select()` — `useProducts()`, all product listing
9. `supabase.from('products').select().eq('id', id).single()` — `useProduct()`, product detail
10. `supabase.from('products').select().ilike('name', query)` — Search
11. `supabase.from('products').select().eq('category_id', id)` — Category filter
12. `supabase.from('products').select().eq('manufacturer_id', id)` — Manufacturer filter

### Categories & Manufacturers Functions
13. `supabase.from('categories').select()` — Category listing
14. `supabase.from('manufacturers').select()` — Manufacturer listing

### Cart Functions
15. `supabase.from('cart_items').select().eq('user_id', id)` — Load cart
16. `supabase.from('cart_items').insert({ ... })` — Add to cart
17. `supabase.from('cart_items').update({ quantity }).eq('id', id)` — Update quantity
18. `supabase.from('cart_items').delete().eq('id', id)` — Remove from cart
19. `supabase.from('cart_items').delete().eq('user_id', id)` — Clear cart after checkout

### Orders Functions
20. `supabase.from('orders').select().eq('customer_id', id)` — Order list
21. `supabase.from('orders').select().eq('id', id).single()` — Order detail
22. `supabase.from('orders').insert({ ... })` — Create order
23. `supabase.from('orders').update({ status }).eq('id', id)` — Update order status
24. `supabase.from('order_items').insert({ ... })` — Create order items

### Order Timeline Functions
25. `supabase.from('order_timeline').select().eq('order_id', id)` — Timeline entries
26. `supabase.from('order_timeline').insert({ ... })` — Add timeline entry

### Address Functions
27. `supabase.from('addresses').select().eq('user_id', id)` — Load addresses
28. `supabase.from('addresses').insert({ ... })` — Add address
29. `supabase.from('addresses').update({ ... }).eq('id', id)` — Update address
30. `supabase.from('addresses').delete().eq('id', id)` — Delete address

### Delivery Cycle Functions
31. `supabase.from('delivery_cycles').select().eq('customer_id', id)` — Load delivery cycles
32. `supabase.from('delivery_cycle_items').select().eq('delivery_cycle_id', id)` — Load cycle products
33. `supabase.from('delivery_cycles').insert({ ... })` — Create delivery cycle

### Notification Functions
34. `supabase.from('notifications').select().eq('user_id', id)` — Load notifications
35. `supabase.from('notifications').update({ is_read }).eq('id', id)` — Mark as read
36. `supabase.realtime.channel('notifications').subscribe()` — Real-time notifications

### Inventory Functions (Admin Only)
37. `supabase.from('inventory').select().eq('product_id', id)` — Check inventory
38. `supabase.from('inventory').update({ ... }).eq('id', id)` — Update inventory
39. `supabase.from('inventory_adjustments').insert({ ... })` — Log adjustment

### Return Functions
40. `supabase.from('return_requests').select().eq('customer_id', id)` — Load returns
41. `supabase.from('return_requests').insert({ ... })` — Create return request

### Storage Functions
42. `supabase.storage.from('product-images').upload(file, path)` — Upload product image
43. `supabase.storage.from('product-images').getPublicUrl(path)` — Get product image URL
44. `supabase.storage.from('avatars').upload(file, path)` — Upload avatar
45. `supabase.storage.from('avatars').getPublicUrl(path)` — Get avatar URL

---

## 15. File-to-Backend Mapping

| File | Backend Functions Needed |
|------|------------------------|
| `src/providers/AuthProvider.tsx` | Auth signUp, signIn, signOut, getUser, updateUser |
| `src/providers/CartProvider.tsx` | Cart CRUD (select, insert, update, delete) |
| `src/hooks/useProducts.ts` | Products select with filters/pagination |
| `src/hooks/useProduct.ts` | Products select single |
| `src/hooks/useOrders.ts` | Orders select, order_items select |
| `src/hooks/useDeliveryCycle.ts` | Delivery cycles select |
| `src/hooks/useNotifications.ts` | Notifications select, Realtime |
| `src/hooks/useCart.ts` | Cart CRUD |
| `src/app/(customer)/checkout.tsx` | Orders insert, order_items insert, cart delete, addresses select |
| `src/app/(customer)/order/[orderId].tsx` | Orders select single, order_timeline select |
| `src/app/(customer)/delivery-cycle.tsx` | Delivery cycles select, delivery_cycle_items select |
| `src/app/(customer)/address/edit.tsx` | Addresses insert/update |
| `src/app/(customer)/account/addresses.tsx` | Addresses select, delete |
| `src/app/(customer)/account/notifications.tsx` | Notifications select, update |
| `src/app/(customer)/search.tsx` | Products select with ilike |
| `src/app/(auth)/welcome.tsx` | Auth getSession |
| `src/app/(auth)/login.tsx` | Auth signInWithPassword |
| `src/app/(auth)/register.tsx` | Auth signUp |
| `src/app/(auth)/forgot-password.tsx` | Auth resetPasswordForEmail |
| `src/app/(auth)/reset-password.tsx` | Auth updateUser (password reset) |
| `src/app/(admin)/*` | All admin CRUD operations, inventory, returns, audit logs, Storage |

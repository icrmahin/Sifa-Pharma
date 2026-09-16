# Hibbullah Pharmacy App - Full Project Documentation

## Overview

**Hibbullah** is a cross-platform pharmacy e-commerce mobile application built with React Native and Expo. It serves two user roles — **customers** (browse products, place orders, track deliveries) and **admins** (manage inventory, orders, customers, and reports). Authentication is handled exclusively through Google OAuth via Supabase.

| Property | Value |
|---|---|
| Package name | `com.hibbullah.app` |
| Android package | `com.icrmahin.hibbullahapp` |
| Version | `1.0.1` |
| Scheme (deep links) | `comhibbullahapp` |
| Currency | KES (KSh) |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Auth method | Google OAuth only (manual login disabled) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.86 + Expo SDK 57 |
| Navigation | expo-router (file-based routing) |
| Language | TypeScript 6 (strict mode) |
| Backend/DB | Supabase (PostgreSQL, Auth, Storage) |
| State | React Context (AuthProvider, CartProvider) |
| Storage | expo-secure-store (native), localStorage (web) |
| Styling | StyleSheet (no external UI library) |
| Build | EAS Build (development / preview / production) |
| Linting | ESLint with expo config |

---

## File Structure

```
com.hibbullah.app-auth/
├── app.json                    # Expo app configuration
├── eas.json                    # EAS Build profiles
├── tsconfig.json               # TypeScript config (strict, path aliases)
├── .env                        # Supabase URL, anon key, mock toggle
├── package.json                # Dependencies and scripts
│
├── assets/                     # Static assets
│   └── images/
│       ├── logo/               # App logo PNG
│       └── placeholders/       # Placeholder images
│
├── scripts/                    # Project scripts (reset-project.js)
│
├── supabase/                   # Supabase project files
│   └── migrations/             # SQL migration files
│
├── dist/                       # Web export (static HTML)
│
└── src/                        # Application source code
    ├── app/                    # Expo Router pages (file-based routing)
    │   ├── _layout.tsx         # Root layout (providers + StatusBar)
    │   ├── index.tsx           # Entry redirect (auth → admin or customer)
    │   │
    │   ├── (auth)/             # Authentication screens
    │   │   ├── _layout.tsx
    │   │   ├── welcome.tsx     # Login screen (Google OAuth)
    │   │   ├── forgot-password.tsx
    │   │   └── reset-password.tsx
    │   │
    │   ├── (admin)/            # Admin panel (requires admin role)
    │   │   ├── _layout.tsx     # Admin layout guard + bottom nav
    │   │   ├── index.tsx       # Admin dashboard
    │   │   ├── products/       # Product management (list, add, edit, detail)
    │   │   ├── inventory/      # Inventory (overview, batches, expiry, adjustment)
    │   │   ├── orders/         # Order management (list, detail)
    │   │   ├── customers/      # Customer records (list, detail)
    │   │   ├── reports/        # Sales & inventory reports
    │   │   ├── returns/        # Return request management
    │   │   └── audit/          # Audit log
    │   │
    │   └── (customer)/         # Customer-facing screens
    │       ├── _layout.tsx     # Customer layout guard + bottom nav
    │       ├── (tabs)/         # Tab navigation (Home, Products, Orders, Cart, Account)
    │       │   ├── _layout.tsx
    │       │   ├── index.tsx   # Home tab
    │       │   ├── products.tsx
    │       │   ├── orders.tsx
    │       │   ├── cart.tsx
    │       │   └── account.tsx
    │       ├── search.tsx      # Product search
    │       ├── checkout.tsx    # Checkout flow
    │       ├── delivery-cycle.tsx  # Active delivery cycle view
    │       ├── products/       # Product detail, categories, manufacturers
    │       ├── order/          # Order detail
    │       ├── account/        # Profile, settings, addresses, notifications
    │       └── address/        # Address editing
    │
    ├── components/             # Reusable UI components
    │   ├── admin/              # Admin-specific components
    │   │   ├── AdminDrawer.tsx
    │   │   ├── AdminHeader.tsx
    │   │   ├── AdminNavigation.tsx
    │   │   ├── AdminOrderCard.tsx
    │   │   ├── AdminProductCard.tsx
    │   │   ├── AdminStatCard.tsx
    │   │   ├── InventoryStatus.tsx
    │   │   └── ProductForm.tsx
    │   ├── cart/               # Cart components
    │   │   ├── CartItem.tsx
    │   │   ├── CartSummary.tsx
    │   │   └── QuantitySelector.tsx
    │   ├── common/             # Shared components
    │   │   ├── AppLogo.tsx
    │   │   ├── Button.tsx
    │   │   ├── CustomerNavigation.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── ErrorState.tsx
    │   │   ├── FilterChip.tsx
    │   │   ├── Header.tsx
    │   │   ├── ImageUpload.tsx
    │   │   ├── Input.tsx
    │   │   ├── LoadingState.tsx
    │   │   ├── Modal.tsx
    │   │   ├── SearchBar.tsx
    │   │   ├── StatusBadge.tsx
    │   │   └── ImageUpload.tsx
    │   ├── orders/             # Order components
    │   │   ├── OrderCard.tsx
    │   │   ├── OrderStatus.tsx
    │   │   └── OrderSummary.tsx
    │   └── products/           # Product components
    │       ├── CategoryCard.tsx
    │       ├── DiscountBadge.tsx
    │       ├── ManufacturerCard.tsx
    │       ├── ProductCard.tsx
    │       ├── ProductImage.tsx
    │       └── ProductPrice.tsx
    │
    ├── constants/              # Design system constants
    │   ├── colors.ts           # Color palette (primary green #023719, gold, status colors)
    │   ├── config.ts           # App config (currency, delivery fee, thresholds)
    │   ├── shadows.ts          # Shadow presets
    │   ├── sizes.ts            # Border radius, icon sizes
    │   ├── spacing.ts          # Spacing scale (xs–xxl)
    │   └── typography.ts       # Font sizes and weights
    │
    ├── hooks/                  # Custom React hooks
    │   ├── useAdmin.ts         # Admin dashboard data
    │   ├── useAuth.ts          # Re-export from AuthProvider
    │   ├── useCart.ts          # Re-export from CartProvider
    │   ├── useDeliveryCycle.ts # Active delivery cycle
    │   ├── useNotifications.ts # Notifications list
    │   ├── useOrders.ts        # Customer orders
    │   ├── useProduct.ts       # Single product by ID
    │   ├── useProducts.ts      # Product list with filters
    │   ├── useResponsive.ts    # Window dimension hook
    │   └── useUser.ts          # Current user profile
    │
    ├── lib/                    # Core library / utilities
    │   ├── env.ts              # Environment variable access + mock toggle
    │   ├── result.ts           # ServiceResult type + wait() helper
    │   ├── session.ts          # Session persistence (SecureStore / localStorage)
    │   ├── storage.ts          # Supabase Storage helpers (product images)
    │   └── supabase.ts         # Supabase client initialization
    │
    ├── providers/              # React Context providers
    │   ├── AppProviders.tsx    # Combines AuthProvider + CartProvider
    │   ├── AuthProvider.tsx    # Auth state, session, role resolution
    │   └── CartProvider.tsx    # Cart state and operations
    │
    ├── services/               # Business logic / data access
    │   ├── authService.ts      # Google OAuth, session resolution, user lookup
    │   ├── mockData.ts         # In-memory seed store (all mock data)
    │   ├── addressService.ts   # Address CRUD
    │   ├── cartService.ts      # Cart operations (add, remove, update, summarize)
    │   ├── categoryService.ts  # Category list
    │   ├── deliveryCycleService.ts  # Active delivery cycle
    │   ├── manufacturerService.ts   # Manufacturer list
    │   ├── notificationService.ts   # Notifications
    │   ├── orderService.ts     # Order CRUD + status updates
    │   ├── productService.ts   # Product search, filtering, catalog
    │   └── admin/              # Admin-specific services
    │       ├── adminProductService.ts
    │       ├── auditService.ts
    │       ├── batchService.ts
    │       ├── customerService.ts
    │       ├── dashboardService.ts
    │       ├── inventoryService.ts
    │       ├── orderManagementService.ts
    │       ├── reportService.ts
    │       └── returnService.ts
    │
    ├── types/                  # TypeScript type definitions
    │   ├── address.ts
    │   ├── audit.ts
    │   ├── auth.ts             # Role, AuthSession, LoginForm, RegisterForm
    │   ├── cart.ts             # CartItem, CartSummary
    │   ├── category.ts
    │   ├── database.ts         # Supabase Database types (all tables)
    │   ├── deliveryCycle.ts
    │   ├── inventory.ts
    │   ├── manufacturer.ts
    │   ├── notification.ts
    │   ├── order.ts            # OrderStatus, OrderItem, Order
    │   ├── product.ts          # Product, ProductListItem
    │   ├── return.ts
    │   └── user.ts             # User, Address
    │
    └── utils/                  # Utility functions
        ├── currency.ts         # formatCurrency (KES)
        ├── date.ts             # Date formatting helpers
        ├── errorHandling.ts    # Error handling utilities
        ├── formatting.ts       # General formatting
        └── validation.ts       # Input validation
```

---

## Architecture

### Application Flow

```
Entry (index.tsx)
  ├─ No session → /(auth)/welcome     (Google login)
  ├─ Admin role  → /(admin)           (Admin dashboard + management)
  └─ Customer    → /(customer)/(tabs) (Customer shopping experience)
```

### Provider Hierarchy

```
SafeAreaProvider
  └─ AppProviders
       ├─ AuthProvider          (session, user, role, signOut)
       └─ CartProvider          (cart items, summary, add/remove)
```

### Data Flow Pattern

```
Screen → Hook → Service → Mock Store (in-memory)
                           └─ or → Supabase (when EXPO_PUBLIC_USE_MOCK=false)
```

All services return `Promise<T>` and include a simulated delay via `wait()`. In mock mode, data lives in `src/services/mockData.ts`. When `EXPO_PUBLIC_USE_MOCK=false`, services hit Supabase directly.

---

## Authentication System

### How It Works

1. **Entry point**: `src/app/index.tsx` checks `useAuth().session`
2. **No session** → redirects to `/(auth)/welcome`
3. **Welcome screen** offers "Login with Google" button
4. **Google OAuth flow** (`authService.signInWithGoogle()`):
   - Calls `supabase.auth.signInWithOAuth({ provider: "google" })`
   - Opens browser via `expo-web-browser`
   - Parses callback URL for `access_token` and `refresh_token`
   - Calls `supabase.auth.setSession()` with tokens
5. **Session resolution** (`resolveAuthSession()`):
   - Fetches profile from `profiles` table
   - Falls back to mock data, user metadata, or email heuristics
   - Auto-creates profile via upsert if missing
6. **Admin verification** (`verifyAdminStatus()`):
   - Queries `admin_users` table for the email
   - Case-insensitive match
   - Sets `isAdmin` flag and overrides role

### Role Resolution Priority

```
1. profiles.role (Supabase DB)
2. user_metadata.role (Supabase Auth)
3. app_metadata.role (Supabase Auth)
4. Mock store role
5. Email heuristic: admin@hibbullah.app → "admin"
```

**Note**: Manual login and registration are disabled. Only Google OAuth is supported.

### Session Persistence

- **Native**: `expo-secure-store` (key: `hibbullah.session`)
- **Web**: `localStorage` (key: `hibbullah.session`)
- Session is saved after every auth state change

### Development Mock Mode

When `EXPO_PUBLIC_USE_MOCK=true` (default):
- No real Supabase session required
- A mock admin session is synthesized from `mockData.ts`
- Mock session is state-only (never persisted)
- Real Supabase auth always takes priority

---

## Database Schema (Supabase)

### Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `admin_users` | Admin email whitelist | `id`, `email`, `created_at` |
| `profiles` | User profiles | `id`, `name`, `email`, `phone`, `role`, `created_at` |
| `products` | Product catalog | `id`, `name`, `brand`, `generic_name`, `price`, `original_price`, `discount_percent`, `stock`, `image_path`, `is_active`, `is_featured` |
| `categories` | Product categories | `id`, `name`, `slug`, `description` |
| `manufacturers` | Drug manufacturers | `id`, `name`, `country` |
| `product_batches` | Batch tracking | `id`, `product_id`, `batch_number`, `quantity`, `expiry_date`, `purchase_cost`, `status` |
| `carts` | Shopping carts | `id`, `customer_id`, `updated_at` |
| `cart_items` | Cart contents | `id`, `cart_id`, `product_id`, `quantity` |
| `orders` | Customer orders | `id`, `order_number`, `customer_id`, `status`, `subtotal`, `discount`, `delivery_fee`, `total`, `payment_method`, `address_id` |
| `order_items` | Order line items | `id`, `order_id`, `product_id`, `quantity`, `unit_price`, `discount_percent`, `total` |
| `addresses` | Delivery addresses | `id`, `customer_id`, `label`, `street`, `city`, `county`, `postal_code`, `is_default` |
| `delivery_cycles` | 24-hour delivery windows | `id`, `customer_id`, `status`, `started_at`, `closes_at` |
| `notifications` | User notifications | `id`, `user_id`, `title`, `body`, `type`, `read` |
| `returns` | Return requests | `id`, `order_id`, `customer_id`, `product_id`, `quantity`, `reason`, `status` |
| `audit_logs` | Admin action log | `id`, `actor_id`, `action`, `record_type`, `record_id`, `old_value`, `new_value` |

### Enums

| Enum | Values |
|---|---|
| `order_status` | PENDING, CONFIRMED, PROCESSING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RETURNED |
| `user_role` | customer, admin |

### Triggers

- `on_auth_user_created`: Fires after `INSERT` on `auth.users`, calls `handle_new_user()` to auto-create a profile row.

---

## Routes

### Auth Routes (`/(auth)/`)

| Route | Screen | Purpose |
|---|---|---|
| `/(auth)/welcome` | WelcomeScreen | Google login entry point |
| `/(auth)/forgot-password` | ForgotPassword | Password reset request |
| `/(auth)/reset-password` | ResetPassword | Password reset form |

### Admin Routes (`/(admin)/`)

| Route | Screen | Purpose |
|---|---|---|
| `/(admin)/` | AdminDashboard | Summary stats, attention items, quick actions |
| `/(admin)/products/` | ProductList | All products management |
| `/(admin)/products/add` | AddProduct | Create new product |
| `/(admin)/products/[productId]/` | ProductDetail | View product details |
| `/(admin)/products/[productId]/edit` | EditProduct | Edit product |
| `/(admin)/inventory/` | InventoryOverview | Stock levels overview |
| `/(admin)/inventory/batches` | BatchList | Batch management |
| `/(admin)/inventory/expiry` | ExpiryTracker | Expiring products |
| `/(admin)/inventory/adjustment` | StockAdjustment | Manual stock adjustments |
| `/(admin)/orders/` | OrderList | All customer orders |
| `/(admin)/orders/[orderId]` | OrderDetail | Single order management |
| `/(admin)/customers/` | CustomerList | All customers |
| `/(admin)/customers/[customerId]` | CustomerDetail | Single customer record |
| `/(admin)/reports/` | ReportsIndex | Reports overview |
| `/(admin)/reports/sales` | SalesReport | Sales analytics |
| `/(admin)/reports/inventory` | InventoryReport | Inventory analytics |
| `/(admin)/returns/` | ReturnsList | Return requests |
| `/(admin)/returns/[returnId]` | ReturnDetail | Single return request |
| `/(admin)/audit/` | AuditLog | Admin action history |

### Customer Routes (`/(customer)/`)

| Route | Screen | Purpose |
|---|---|---|
| `/(customer)/(tabs)/` | Home | Featured products, trending, discounts |
| `/(customer)/(tabs)/products` | Products | Product browsing |
| `/(customer)/(tabs)/orders` | Orders | Order history |
| `/(customer)/(tabs)/cart` | Cart | Shopping cart (hidden from tab bar) |
| `/(customer)/(tabs)/account` | Account | Account settings |
| `/(customer)/search` | Search | Product search |
| `/(customer)/checkout` | Checkout | Order checkout |
| `/(customer)/delivery-cycle` | DeliveryCycle | Active 24-hour cycle |
| `/(customer)/products/[productId]` | ProductDetail | Single product view |
| `/(customer)/products/categories` | Categories | Category browsing |
| `/(customer)/products/manufacturers` | Manufacturers | Manufacturer browsing |
| `/(customer)/products/category/[categoryId]` | CategoryProducts | Products in category |
| `/(customer)/products/manufacturer/[manufacturerId]` | ManufacturerProducts | Products by manufacturer |
| `/(customer)/order/[orderId]` | OrderDetail | Single order details |
| `/(customer)/account/profile` | Profile | User profile |
| `/(customer)/account/settings` | Settings | App settings |
| `/(customer)/account/addresses` | Addresses | Delivery addresses |
| `/(customer)/account/notifications` | Notifications | Notification center |
| `/(customer)/account/overview` | AccountOverview | Account summary |
| `/(customer)/address/edit` | EditAddress | Add/edit address |

---

## Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | `""` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `""` |
| `EXPO_PUBLIC_USE_MOCK` | Enable mock data mode | `true` (when unset or missing keys) |

**Mock mode** activates automatically when Supabase credentials are missing or when `EXPO_PUBLIC_USE_MOCK` is not `false`.

---

## Design System

### Colors

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#023719` | Brand green (buttons, accents, headers) |
| `primaryLight` | `#0A5C2E` | Lighter green |
| `gold` | `#A97104` | Warnings, pending states |
| `danger` | `#B3261E` | Errors, cancellations |
| `success` | `#176B3A` | Success states |
| `info` | `#276A82` | Information |
| `background` | `#F2F2F7` | Page background |
| `backgroundAlt` | `#FFFFFF` | Card/panel background |
| `text` | `#1D1D1F` | Primary text |
| `textMuted` | `#8E8E93` | Secondary text |

### Spacing Scale

`xs` (4) → `sm` (8) → `md` (12) → `lg` (16) → `xl` (24) → `xxl` (32)

### Key Config Values

| Config | Value |
|---|---|
| `deliveryFee` | KSh 150 |
| `orderCycleHours` | 24 hours |
| `lowStockThreshold` | 10 units |
| `expiryWarningDays` | 60 days |
| `defaultPageSize` | 20 |

---

## Scripts

| Command | Purpose |
|---|---|
| `npm start` / `pnpm start` | Start Expo dev server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS simulator |
| `npm run web` | Run in web browser |
| `npm run lint` | Run ESLint |
| `npm run reset-project` | Reset project to template |

---

## Path Aliases

Configured in `tsconfig.json`:

| Alias | Resolves To |
|---|---|
| `@/*` | `./src/*` |
| `@/assets/*` | `./assets/*` |

---

## Key Patterns & Conventions

1. **File-based routing**: All screens live under `src/app/` and follow expo-router conventions. Parenthesized folders like `(auth)`, `(admin)`, `(customer)` are route groups (no URL segment). `(tabs)` creates tab navigation.

2. **Role-based layout guards**: Each route group's `_layout.tsx` checks `useAuth()` and redirects unauthorized users. Admin layout checks `isAdmin`, customer layout checks `session`.

3. **Service layer**: All data access goes through service functions in `src/services/`. Each service returns `Promise<T>` and uses `wait()` to simulate network latency.

4. **Mock-first development**: By default, the app runs entirely off in-memory seed data in `mockData.ts`. The `store` object is the single source of truth for mock mode.

5. **Custom hooks**: Each feature domain has a hook (`useProducts`, `useOrders`, etc.) that wraps the corresponding service. Hooks manage loading state and data fetching.

6. **No external UI library**: All components are custom-built using React Native's `StyleSheet`. The design system is defined in `src/constants/`.

7. **Platform-aware icons**: Icons use `expo-symbols` with platform-specific names (iOS SF Symbols, Android Material Icons).

8. **Responsive layout**: Admin screens adapt between compact (phone), tablet, and wide layouts using `useWindowDimensions`.

---

## Deployment

### EAS Build Profiles

| Profile | Distribution | Notes |
|---|---|---|
| `development` | Internal | Development client, dev mode |
| `preview` | Internal | APK (Android), auto-increment version |
| `production` | Store | Auto-increment version, ready for app store |

### Build Commands

```bash
# Development build
eas build --profile development

# Preview (APK)
eas build --profile preview

# Production
eas build --profile production
```

---

## Supabase Setup

### Required Tables

Run the migrations in `supabase/migrations/` to set up the database schema. The key tables are `profiles`, `admin_users`, `products`, `orders`, `order_items`, `cart_items`, `carts`, `addresses`, `delivery_cycles`, `notifications`, `returns`, and `audit_logs`.

### Required Storage Bucket

Create a `products` bucket in Supabase Storage for product images. Images are stored at paths like `{productId}.webp` and `{productId}-primary.webp`.

### Auth Provider

Configure Google OAuth in the Supabase dashboard under Authentication > Providers > Google. Set the client ID and secret from Google Cloud Console.

### Deep Link Scheme

Register the custom scheme `comhibbullahapp` in Supabase's redirect URLs for OAuth callbacks.

---

## Known Notes

- The `mockData.ts` `store` object is mutable and shared across all services — this is intentional for development mocking but would need replacement for real-time data.
- The `database.ts` types define a `stock` column in `products` that doesn't appear in the actual Supabase schema (stock is tracked via `product_batches`).
- Manual login/registration methods throw errors — only Google OAuth is supported.
- The app uses `react-native-worklets` (v0.10.1) for animation support via `react-native-reanimated`.

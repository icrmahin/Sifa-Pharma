# Sifa-Pharma — Frontend State Boundaries

> **Architecture Constraint**: All state management must work with Supabase Free-tier constraints. No WebSocket connections for background data sync, no heavy client-side caching libraries, and no persistent local storage of sensitive data.

---

## 1. State Categories

### 1.1 Local Component State

**Definition**: State consumed only within a single component or small component subtree.

**What belongs here**:
- Form input values within a single form (e.g., quantity selector on product detail)
- Toggle states (modal open/close, dropdown open/close)
- Local loading/submitting states within a single action
- UI-only flags (which tab is pressed, image picker menu state)
- Animation state (press compression scale, opacity)
- Search query within a search bar component
- Image upload progress and preview state

**Examples from current codebase**:
- `ImageUpload` component's `menuOpen` state
- `ProductForm` component's form field values and validation errors
- `CheckoutScreen`'s `address`, `submitting`, `error`, `success` states
- `ProductDetailScreen`'s `quantity` and `feedback` states

**What should NOT live here**:
- User authentication state (global)
- Cart items (shared across screens)
- Product data from the server (server state)
- Any data that must persist across screen navigation

**Supabase Free Constraint**: Local component state does not require any backend resources. It is purely client-side and has no Supabase impact.

---

### 1.2 Screen State

**Definition**: State relevant to a single screen or route, reset when navigating to the screen.

**What belongs here**:
- Whether a screen is loading its initial data
- Error state specific to a screen's data fetch
- Filter selections within a single screen (e.g., admin products filter state)
- Pagination state for a list on a single screen
- Modal/bottom sheet open/close state within a screen
- Search query state within a screen

**Examples from current codebase**:
- `AdminProductsScreen`'s `status`, `stockFilter`, `categoryId`, `query` filter states
- `CustomerSearchScreen`'s `query` state
- `CheckoutScreen`'s `success` flag

**What should NOT live here**:
- Auth session or user data (global)
- Cart contents (persists across screens)
- Data that should be shared across screens (shared client state or server state)

**Supabase Free Constraint**: Screen state is reset on navigation. No persistent Supabase resources are consumed by screen state itself. Filter state determines which queries are sent to Supabase, but the state itself is transient.

---

### 1.3 Shared Client State

**Definition**: State shared across multiple screens, managed through React Context providers.

**What belongs here**:
- Authentication state (current user, session, role, loading status)
- Cart contents and cart summary (items, subtotal, total, item count)
- Active navigation state (current route, which tab is selected)
- Theme/display preferences (if the app supports them)

**Current implementation**:
- `AuthProvider` holds `session`, `user`, `isAdmin`, `loading` — **primary shared client state**
- `CartProvider` holds `items`, `summary`, `itemCount` — **primary shared client state**

**Important rules for Supabase Free**:
- Auth state is derived from Supabase Auth session — stored in React state via Context
- Cart state should ideally be synced with a `cart_items` PostgreSQL table (not just in-memory) — this is FREE on Supabase
- Cart state should NOT persist after user logs out
- Auth state should persist across app restarts via Supabase Auth's automatic session restoration (FREE)

**What should NOT live here**:
- Product catalog data (server data)
- Order history (server data)
- Inventory data (server data)
- Form data that should be discarded when the form is closed
- Any data primarily fetched from the backend

**Supabase Free Constraint**: AuthProvider leverages Supabase Auth's built-in session persistence (FREE). CartProvider should sync with PostgreSQL cart_items table (FREE) rather than relying solely on in-memory state. This ensures cart persistence across app restarts without any paid service.

---

### 1.4 Server / API State

**Definition**: State representing data fetched from the Supabase backend. Includes caching, pagination, loading, and error states.

**What belongs here**:
- Product lists and product details
- Order history and order details
- Customer records
- Inventory data
- Return requests
- Notification data
- Category and manufacturer lists
- Address lists
- Delivery cycle data
- Audit log entries
- Report data

**Current state (2026-09-22)**: Wired. `useProducts`/`useProduct`/`useOrders`/`useAdmin`/`useDeliveryCycle`/`useNotifications` all fetch via Supabase services (`src/services/*` → `src/lib/mappers.ts`) with `loading/error/reload`, pagination `range`, `count: exact`, typed `Product`/`Order`/`AdminDashboardData`. Empty arrays only on no data, not placeholder.

**Important rules for Supabase Free**:
- Server state must NOT live in React Context unless used as a client-side cache
- Each hook that fetches server data should manage its own loading, error, and refetch state
- Data should be fetched from Supabase directly using the Supabase client library
- No heavy caching libraries needed — Supabase queries are fast enough for a small app
- Simple polling on screen focus is sufficient (no WebSocket background subscriptions)

**Supabase Free Constraint**: For a small app, direct Supabase queries on screen focus are sufficient. Supabase Realtime subscriptions are optional and have free-tier limits. Avoid maintaining persistent WebSocket connections for background data sync — use request-response pattern instead.

**Recommended pattern for Supabase Free**:
```
Screen focused → fetch data from Supabase → display
Screen unfocused → no active connection
User performs action → fetch from Supabase → update display
```

This is the most free-tier-friendly approach.

---

### 1.5 Persistent Storage

**Definition**: Data that must survive app restarts, device reboots, and re-installs.

**What belongs here**:
- Supabase Auth session tokens (automatically persisted by Supabase Auth — FREE)
- User preferences (language, notification settings) — stored in PostgreSQL via RLS-protected tables
- Cart data (if stored in PostgreSQL `cart_items` table — FREE)
- Cached images (displayed via Supabase Storage URLs)

**Current state**: No persistent storage is implemented beyond in-memory React state. The `AuthProvider` uses `useState` with a hardcoded `DEV_SESSION`. The `CartProvider` uses `useState` with an empty array.

**Supabase Free Constraint**: Supabase Auth automatically persists sessions across app restarts (FREE). Cart data should be stored in PostgreSQL `cart_items` table (FREE) rather than in-memory state. User preferences can be stored in PostgreSQL tables with RLS (FREE). No local storage of sensitive data needed.

**What should NOT live here**:
- Product catalog data (should be fetched from the server)
- Order history (should be fetched from the server)
- Form drafts (unless explicitly designed as draft persistence)
- Session tokens in plain text without Supabase Auth's secure handling
- Any data that should be server-authoritative

---

## 2. Supabase-Specific State Flow Rules

| Rule | Rationale | Supabase Free Impact |
|------|-----------|---------------------|
| Auth state derived from Supabase Auth session | Supabase Auth handles token storage and refresh | **FREE** — Automatic session persistence |
| Cart synced to PostgreSQL cart_items table | Persists cart across sessions without in-memory dependency | **FREE** — PostgreSQL storage |
| Screen data fetched on focus, not on background | Minimizes database connections and query load | **FREE** — Reduces connection usage |
| No background realtime subscriptions | Supabase Realtime has free-tier connection limits | **FREE** — Avoids hitting limits |
| Server state fetched via Supabase client | Direct query pattern is lightweight | **FREE** — No additional dependencies |
| Polling used instead of persistent connections | Only when real-time updates are needed | **FREE** — Infrequent polling is cheap |
| All RLS policies enforced at database level | Client never bypasses access control | **FREE** — RLS is included in Supabase Free |
| Image URLs stored as text, not BLOBs | Avoids bloating database size | **FREE** — Supabase Storage handles files |

---

## 3. State Boundary Diagram (Supabase-Aware)

```
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE AUTH (Persistent)                        │
│  Session tokens | User ID | Role claims                      │
│  Auto-persisted by Supabase Auth — FREE                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE DATABASE (Persistent)                    │
│  cart_items | profiles | orders | products | addresses |     │
│  All data stored in PostgreSQL with RLS — FREE               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                 SHARED CLIENT STATE                            │
│  AuthProvider: user, session, isAdmin (from Supabase Auth)  │
│  CartProvider: items, summary, itemCount (from cart_items)  │
│  Navigation state (current route, active tab)                │
└────────┬──────────────────────────────────┬─────────────────┘
         │                                  │
         ▼                                  ▼
┌─────────────────────┐          ┌──────────────────────────┐
│    SCREEN STATE      │          │   SERVER / API STATE      │
│  Filter selections  │          │  Products, Orders, Users  │
│  Screen loading      │          │  Inventory, Returns,      │
│  Local pagination    │          │  Notifications, Reports   │
│  Modal open/close    │          │  Categories, Manufacturers│
│  Search query        │          │  Addresses, Audit,        │
│  Checkout state      │          │  Delivery Cycles          │
└─────────────────────┘          └──────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│               LOCAL COMPONENT STATE                            │
│  Form inputs | Toggle states | Animation values              │
│  Image picker menus | Button press states                    │
│  Quantity selectors | Confirmation messages                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Anti-Patterns to Avoid on Supabase Free

| Anti-pattern | Why It's Wrong | Correct Approach | Supabase Free Impact |
|-------------|----------------|-----------------|---------------------|
| Auth state in multiple Contexts | Creates inconsistency | Single AuthProvider from Supabase Auth | **FREE** |
| Cart only in memory | Lost on app restart | Store cart_items in PostgreSQL | **FREE** — Add table |
| Product data hardcoded in screens | Doesn't reflect real catalog | Fetch from Supabase on screen focus | **FREE** |
| Persistent realtime subscriptions | Hits free-tier connection limits | Request-response pattern; query on focus | **FREE** |
| Storing BLOBs in database | Bloats 500MB database limit | Store images in Supabase Storage; store URLs in PostgreSQL | **FREE** — Storage 1GB |
| Complex client-side caching libraries | Unnecessary overhead for small app | Simple fetch on focus pattern | **FREE** |
| Local storage of auth tokens | Security risk | Supabase Auth handles token storage securely | **FREE** |
| Background data sync | Requires persistent connections | Fetch on screen focus only | **FREE** |

---

## 5. Recommended Data Flow for Supabase Free

1. **App starts**: Supabase Auth automatically restores session (FREE)
2. **Screen appears**: Fetch data from Supabase via direct query (FREE)
3. **User interacts**: Mutate data via INSERT/UPDATE/DELETE (FREE)
4. **Screen navigates away**: No active connection (FREE)
5. **User returns to screen**: Re-fetch data (FREE)
6. **User logs out**: Supabase Auth clears session (FREE)
7. **User returns after restart**: Supabase Auth restores session (FREE), data fetched on screen focus

This pattern minimizes database connections, avoids persistent WebSocket overhead, and works entirely within Supabase Free limits.

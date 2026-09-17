# Sifa-Pharma — Backend Responsibilities

> **Architecture Constraint**: The "backend" is implemented entirely as Supabase PostgreSQL database + Supabase Auth + Supabase Storage + Row Level Security + optionally lightweight Edge Functions. There is no separate server process. The mobile client calls Supabase directly.

---

## 1. Responsibility Matrix (Supabase-Adjusted)

| Concern | "Backend" (Supabase) | Mobile Client | Shared |
|---------|---------------------|---------------|--------|
| Business rules | ✓ (PostgreSQL functions, triggers, constraints) | ✗ | — |
| Authorization | ✓ (RLS policies, Supabase Auth) | ✗ | — |
| Data validation | ✓ (NOT NULL, CHECK constraints, triggers) | Client-side feedback only | — |
| Persistence | ✓ (PostgreSQL tables) | ✗ | — |
| Transactions | ✓ (PostgreSQL database functions) | ✗ | — |
| Sensitive operations | ✓ (server-side via database functions) | ✗ | — |
| File/storage operations | ✓ (Supabase Storage) | ✗ | — |
| Presentation | ✗ | ✓ | — |
| Interaction | ✗ | ✓ | — |
| Local UI state | ✗ | ✓ | — |
| Navigation | ✗ | ✓ | — |
| Client-side validation/feedback | ✗ | ✓ | — |
| Caching (client-side) | ✗ | ✓ | — |
| Auth token storage | ✗ | ✓ (Supabase Auth handles this) | — |
| Session management | ✓ (Supabase Auth) | ✗ | — |
| Real-time subscriptions | ✓ (Supabase Realtime — optional) | ✓ (subscribe/unsubscribe) | — |

---

## 2. "Backend" Must Own (Supabase Implementation)

### 2.1 Business Rules

The Supabase database is the single source of truth for all business logic. Rules are enforced through PostgreSQL constraints, triggers, and database functions.

**Specific business rules and their Supabase implementation**:

| Business Rule | Supabase Implementation | FREE? |
|---------------|------------------------|-------|
| Order totals calculated server-side | Database function: compute subtotal, discount, deliveryFee, total | **FREE** |
| Stock validation before order | Database function checks `inventory_items.quantity` | **FREE** |
| Price consistency | Database function validates current catalog prices | **FREE** |
| Discount rules (0-99%) | CHECK constraint on `products.discount_percent` | **FREE** |
| Delivery fee (KSh 150) | Config constant in database function | **FREE** |
| Order status transitions | Database function or CHECK constraint + trigger | **FREE** |
| Return eligibility (only delivered orders) | Database function validates `orders.status = 'DELIVERED'` | **FREE** |
| Stock adjustment validation | Trigger on `stock_adjustments` validates quantity and reason | **FREE** |
| Expiry warnings (60 days) | Database function or view comparing `expiryDate` to current date | **FREE** |
| Low stock threshold (10 units) | View or trigger calculating `status` from quantity | **FREE** |
| Delivery cycle management | Database function creates cycles with computed `closesAt` | **FREE** (timing is FREE-TIER RISK) |

### 2.2 Authorization

All access control is enforced via Row Level Security (RLS) policies using Supabase Auth JWT claims.

**Specific authorization rules**:

| Rule | RLS Implementation | FREE? |
|------|-------------------|-------|
| Users access own data | `auth.uid() = user_id` | **FREE** |
| Admin-only tables | `auth.jwt() -> 'role' = 'admin'` | **FREE** |
| Public read access | `USING (true)` or `auth.uid() IS NOT NULL` | **FREE** |
| Admin cannot modify customer data | RLS policy excludes admin for customer-specific tables (if product decision requires) | **FREE** |
| Customer cannot access admin tables | RLS policy on admin tables restricts to admin role | **FREE** |

### 2.3 Data Validation

PostgreSQL enforces all data validation at the database level.

**Specific validation rules and Supabase implementation**:

| Validation | Supabase Implementation | FREE? |
|------------|------------------------|-------|
| Required fields | NOT NULL constraints | **FREE** |
| Email format | CHECK constraint or Supabase Auth handles it | **FREE** |
| Phone number format (+254...) | CHECK constraint on `profiles.phone` | **FREE** |
| Price must be positive | CHECK constraint (`price > 0`) | **FREE** |
| Stock must be non-negative integer | CHECK constraint (`stock >= 0`) | **FREE** |
| Discount 0-99% | CHECK constraint (`discount_percent BETWEEN 0 AND 99`) | **FREE** |
| Expiry date must be valid future date | CHECK constraint or trigger | **FREE** |
| Image URL format | Trigger validation | **FREE** |
| Order status transitions | Database function validates allowed transitions | **FREE** |
| Return quantity ≤ ordered quantity | Database function validates | **FREE** |
| Adjustment quantity is positive integer | CHECK constraint on `stock_adjustments.quantity` | **FREE** |

### 2.4 Persistence

All data is stored in PostgreSQL tables managed by Supabase.

**Persistence rules**:

- All domain data lives in PostgreSQL tables (FREE)
- Images are stored in Supabase Storage buckets (1GB free, FREE)
- The database has a 500MB limit on Supabase Free (FREE, sufficient for small app)
- Referential integrity is maintained via foreign key constraints (FREE)
- The server must handle concurrent access — PostgreSQL handles this natively (FREE)

### 2.5 Transactions

Complex operations that involve multiple table changes must use PostgreSQL database functions to ensure atomicity.

| Transaction | Supabase Implementation | FREE? |
|-------------|------------------------|-------|
| Order placement (deduct stock, create order, create order_items, clear cart) | Single database function with `BEGIN`/`COMMIT` | **FREE** |
| Stock adjustment (update inventory, record adjustment, create audit entry) | Trigger or function | **FREE** |
| Return processing (update return status, adjust stock) | Database function | **FREE** |
| Cart to order conversion | Combined checkout function | **FREE** |

### 2.6 Sensitive Operations

Operations involving security, financial, or privacy-sensitive actions must be handled server-side.

**Specific sensitive operations**:

| Operation | Supabase Implementation | FREE? |
|-----------|------------------------|-------|
| Password hashing | Supabase Auth handles this automatically | **FREE** |
| Token issuance/refresh | Supabase Auth handles this automatically | **FREE** |
| Order status changes | Database function with RLS check | **FREE** |
| Admin actions (product changes, stock adjustments) | Database functions + audit trigger | **FREE** |
| Customer data access | RLS policy + audit trigger | **FREE** |
| Image upload validation | Supabase Storage bucket policies + database trigger | **FREE** |
| Payment processing | Not applicable (COD only) — N/A | **N/A** |

### 2.7 Storage Access

Supabase Storage handles all file operations.

| Storage Operation | Supabase Implementation | FREE? |
|-------------------|------------------------|-------|
| Product image upload | `supabase.storage.from('product-images').upload()` | **FREE** (1GB limit) |
| Image URL retrieval | `supabase.storage.from('product-images').getPublicUrl()` | **FREE** |
| Avatar upload | `supabase.storage.from('avatars').upload()` | **FREE** |
| File deletion | `supabase.storage.from('bucket').remove()` | **FREE** |
| File type/size validation | Storage bucket policies | **FREE** |

---

## 3. Mobile Client Must Own

### 3.1 Presentation

The mobile client owns all visual rendering.

**Specific responsibilities**:
- Rendering product lists, detail pages, category browsing, search results
- Displaying order details, timelines, delivery cycle information
- Rendering cart with item quantities, prices, totals
- Displaying checkout form, address inputs, payment method (COD)
- Rendering admin dashboards, inventory tables, reports
- Displaying authentication screens (login, registration, forgot password, reset password)
- Rendering account management screens (profile, addresses, notifications, settings)
- Displaying status badges (in stock, out of stock, order statuses, return statuses)

### 3.2 Interaction

The mobile client owns all user interaction handling.

**Specific responsibilities**:
- Handling tap, scroll, swipe, and gesture interactions
- Managing navigation between screens via Expo Router
- Handling form input and validation feedback
- Managing image picker interactions (gallery selection, camera capture via `expo-image-picker`)
- Handling pull-to-refresh and infinite scroll
- Managing modal and bottom sheet interactions
- Handling animation and motion feedback (press compression, page transitions)
- Managing the tab bar navigation (home, products, orders, cart, account)
- Handling the admin drawer menu (inventory, customers, reports, returns, audit)

### 3.3 Local UI State

The mobile client owns all transient UI state.

**Specific responsibilities**:
- Form input values and validation errors within a single form
- Whether a modal, bottom sheet, or dropdown is open or closed
- The current search query within a screen
- Filter selections within a single screen
- Loading/submitting states within a single action
- Confirmation dialog open/close state
- Animation states
- Image upload progress and preview state

### 3.4 Navigation

The mobile client owns all routing and navigation logic.

**Specific responsibilities**:
- Managing the route stack via Expo Router
- Passing parameters between screens via route params
- Managing the tab bar selection state
- Managing the admin drawer open/close state
- Handling deep links and navigation outside the app
- Managing redirects (e.g., after successful login, after checkout)

### 3.5 Client-Side Validation and Feedback

The mobile client provides immediate UX feedback before making Supabase calls.

**Specific responsibilities**:
- Checking that required form fields are not empty
- Validating email format and phone number format before submission
- Checking that numeric fields are valid numbers within expected ranges
- Showing inline error messages when validation fails
- Disabling submit buttons while a request is in progress
- Showing loading indicators during data fetching or submission
- Displaying success, error, and informational messages
- Showing optimistic UI updates (e.g., immediately adding item to cart display before Supabase confirms)

**Important**: All client-side validation is for UX only. The Supabase database validates all data on the server side.

### 3.6 Caching

The mobile client may cache server responses locally for UX performance.

**Specific responsibilities**:
- Caching product lists and product details for faster browsing
- Caching category and manufacturer lists (rarely change)
- Caching the user's profile data
- Caching order history for viewing without network access
- Caching address data

**Important**: The client must not present cached data as current without indicating staleness. For a small app, simple fetch-on-screen-focus is sufficient and avoids complex caching libraries.

### 3.7 Supabase Client Integration

The mobile client uses the Supabase client library to interact with the database.

**Specific responsibilities**:
- Initialize Supabase client with project URL and anon key
- Sign in/out via Supabase Auth
- Execute SELECT/INSERT/UPDATE/DELETE queries using the Supabase client
- Upload/download files via Supabase Storage
- Handle authentication state changes via `onAuthStateChange`
- Pass the user's JWT automatically via the Supabase client (it attaches the token)

**Supabase Free Constraint**: The Supabase client library is the only required dependency for backend communication. No additional API framework, no Express server, no custom backend server.

---

## 4. What the Mobile Client Should NOT Do

| Anti-pattern | Why It's Wrong | Correct Approach | Supabase Free Impact |
|-------------|----------------|-----------------|---------------------|
| Calculating order totals on the client | Client can be tampered with; totals must be authoritative | Send cart contents to database function; it calculates totals | **FREE** |
| Trusting client-side stock checks | Stock could change between check and database call | Database function validates stock at order time | **FREE** |
| Implementing custom auth logic | Supabase Auth handles all auth securely | Use `supabase.auth.signInWithPassword()` etc. | **FREE** |
| Bypassing the database to modify data | Breaks data integrity | All data modifications go through Supabase client queries | **FREE** |
| Assuming the user's role | Client can be modified to impersonate any role | Database RLS validates role from JWT | **FREE** |
| Storing product catalog locally as source of truth | Data becomes stale | Supabase is the source of truth; client caches for performance | **FREE** |
| Implementing business logic duplicated from database | Creates two sources of truth | Client handles presentation; database handles logic | **FREE** |
| Accessing admin endpoints with customer token | Security violation | Supabase RLS rejects unauthorized requests | **FREE** |
| Modifying product catalog from client without server validation | Data integrity issues | Database constraints and triggers validate all changes | **FREE** |
| Building a custom API server | Unnecessary complexity and cost for $0 budget | Direct Supabase client calls to PostgreSQL | **FREE** |
| Using WebSockets for background data sync | Hits free-tier Realtime connection limits | Request-response pattern; query on screen focus | **FREE** |

---

## 5. Communication Rules (Supabase-Free)

### 5.1 Request Format

All database operations use the Supabase client library:
- `supabase.from('table').select()` — Read
- `supabase.from('table').insert()` — Create
- `supabase.from('table').update().eq()` — Update
- `supabase.from('table').delete().eq()` — Delete
- `supabase.storage.from('bucket').upload()` — File upload
- `supabase.auth.signInWithPassword()` — Authentication

### 5.2 Response Format

Supabase client returns:
- Success: `{ data, error }` — Standard Supabase response pattern
- Error: `{ error: { message, code } }`

The existing `ServiceResult<T>` pattern (`ok<T>()` / `fail<T>()`) in `src/lib/result.ts` is compatible and can wrap Supabase responses.

### 5.3 Error Handling

The client must handle all Supabase responses gracefully:
- Network errors → Show offline/error message
- Validation errors (RULE_VIOLATION) → Display inline error messages
- Authentication errors (INVALID_CREDENTIALS, SESSION_EXPIRED) → Redirect to login and clear session
- Authorization errors (RLS_POLICY_VIOLATION) → Show "Access denied" message
- Server errors → Show "Something went wrong. Please try again."

### 5.4 Timeout and Retry

The client must handle request timeouts and implement appropriate retry logic for transient failures. For a small app, simple retry with exponential backoff is sufficient.

---

## 6. Summary of Layer Boundaries (Supabase-Free)

### Supabase "Backend" owns:
- All business rules (via PostgreSQL functions, triggers, constraints)
- All authorization and authentication (via Supabase Auth + RLS)
- All data validation (via NOT NULL, CHECK constraints, triggers)
- All data persistence (via PostgreSQL tables)
- All transactions (via database functions)
- All file storage (via Supabase Storage)
- All session and token management (via Supabase Auth)
- All audit logging (via database triggers)
- All API access (via direct Supabase client calls)
- All RLS policies (via PostgreSQL RLS)

### Mobile Client owns:
- All visual rendering and UI
- All user interaction handling
- Navigation and routing via Expo Router
- Local UI state (forms, modals, toggles)
- Client-side validation for UX feedback
- Image picker interactions
- Animation and motion
- Caching for performance
- Supabase Auth token storage (handled by Supabase client)
- Supabase client integration (all database calls)
- Offline queue (if implemented — not required for MVP)
- Optimistic UI updates
- Display of server data (presentation layer)

### Not needed at all (because Supabase handles it):
- Custom API server (Express, Fastify, etc.)
- Custom authentication logic
- Custom authorization middleware
- Session management code
- File storage server
- Any backend framework or runtime

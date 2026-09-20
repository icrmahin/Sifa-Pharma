# Sifa-Pharma — Build TODO

## Sprint: UI/UX Overhaul — 2026-09-21
> Instructions captured verbatim then expanded into actionable tasks.
> **Constraint:** No git add / commit / push.

### Raw Instructions From Owner
1. Home page navigation (customer side): **remove** search, favorites, admin navigations.
2. New navigation (customer `+` admin) items: `i. Home  ii. Cart  iii. Favorites  iv. Orders (customer side)  v. Settings`.
3. Admin panel is accessible from the Settings menu only.
4. Top-right cart button → replaced by **notification** button.
5. Product details page: remove top Expo default navigator/Header to gain space; strip unnecessary info — keep **only** image, name, price, status (stock etc.), qty `+`/`-` selector, **Add to Cart** + **Cancel** button.
6. Checkout page: proper section spacing; add **delete saved location** option; remove top `Checkout` + `<-` title bar (bring content higher) + add floating top-right **go-back** button; `Add new address` must be compact + thumb-reachable; `Add new address` + `Submit order` in **one row**.
7. Cart semantics: 1 product = 1 cart item regardless of quantity (e.g. 10 packs of Napa = “1 item in cart”); `+`/`-` must be **optimistic** — no full reload per increment/decrement.

### Decomposed Tasks
- [ ] **NAV-01** Update `CustomerNavigation.tsx` — 5 items only, remove admin tab
- [ ] **NAV-02** Update `(tabs)/_layout.tsx` — tabs align to Home/Cart/Favorites/Orders/Settings
- [ ] **NAV-03** Update `CustomerDesktopHeader.tsx` — notifications icon instead of cart; clean nav links
- [ ] **NAV-04** Update `(customer)/(tabs)/index.tsx` top bar — notifications instead of cart
- [ ] **SETTINGS-01** Ensure admin entry lives ONLY in `account.tsx` Settings
- [ ] **PDP-01** Redesign `products/[productId].tsx` — no Header, minimal info, qty +/-, Add to Cart + Cancel
- [ ] **CHECKOUT-01** Redesign `checkout.tsx` — floating back, spacing, delete address, row buttons
- [ ] **CART-01** `CartProvider.tsx` — expose `distinctCount`, optimistic `setQuantity`/`addItem` without reload
- [ ] **CART-02** Wire all badges to `distinctCount` (not `itemCount`)
- [ ] **QA** `tsc --noEmit` + `expo lint` + manual verification

---

## Foundation (Completed)
- [x] **01 — Project foundation** — TS, Expo, ESLint, Git, structure
- [x] **02 — Brand assets** — logos, icons, fonts
- [x] **03 — Design tokens** — palette, typography, spacing, radius, shadows
- [x] **04 — Core UI foundation** — primitives, buttons, inputs, etc.
- [x] **05 — Industrial Transparent UI system**
- [x] **06 — Physics / interaction system**
- [x] **07 — Product architecture** — roles, flows, boundaries
- [x] **08 — Backend from scratch** — schema, RLS, auth, storage

## In-Progress / Remaining
- [ ] **09 — Build the product** — auth, catalogue, cart, orders, notifications, settings
- [ ] **10 — Integration** — frontend → API → DB, empty/error/offline states
- [ ] **11 — Testing & quality** — typecheck, lint, unit/integration, perms
- [ ] **12 — Performance / APK discipline** — deps, assets, bundle, startup/mem
- [ ] **13 — EAS production** — config, prod env, AAB/APK, device test
- [ ] **14 — Final polish** — UI/a11y/perf/security audit, cleanup, docs

Sequence: **Brand → Tokens → UI primitives → UI system → Physics → Architecture → Backend → Features → Integration → Testing → EAS → Optimization → Release**

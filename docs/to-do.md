
### Sifa-Pharma — Main Build TODO

* [x] **01 — Project foundation**

  * Clean the cloned project
  * Remove inherited Hibbullah backend/Supabase code
  * Establish Sifa-Pharma project structure
  * Configure TypeScript, Expo, ESLint, formatting, Git
  * Add reusable `AGENT.md`

* [x] **02 — Brand assets**

  * Add finalized Sifa-Pharma logo
  * Add light/dark logo variants
  * Add app icon
  * Add required fonts
  * Optimize all image assets
  * Establish asset naming/conventions

* [x] **03 — Design tokens**

  * Deep Green `#123C35`
  * Sage Green `#8FB8A8`
  * Warm Gold `#D7B878`
  * Off-White `#F6F7F4`
  * Charcoal `#18201E`
  * Typography system
  * Spacing scale
  * Radius scale
  * Border system
  * Shadow/elevation system
  * Motion/physics tokens

* [x] **04 — Core UI foundation**

  * Screen/container primitives
  * Typography components
  * Buttons
  * Icon buttons
  * Inputs
  * Selects
  * Cards
  * Badges/chips
  * Toggles
  * Alerts
  * Navigation
  * Tabs
  * Lists
  * Tables where actually needed
  * Loading/empty/error states

* [x] **05 — Industrial Transparent UI system**

  * Layered surfaces
  * Controlled transparency
  * Borders/dividers
  * Soft depth
  * Technical visual details
  * Consistent component geometry
  * Avoid excessive glass/blur
  * Keep everything readable and functional

* [x] **06 — Physics / interaction system**

  * Press compression
  * Spring-based transitions
  * Bouncy navigation
  * Card interaction
  * Gesture feedback
  * Modal/sheet movement
  * Microinteractions
  * Reduced-motion handling
  * Performance-safe animation architecture

* [ ] **07 — Product architecture**

  * Define actual Sifa-Pharma requirements
  * Define domain entities
  * Define user roles
  * Define application flows
  * Define frontend state boundaries
  * Define API boundaries
  * Define backend responsibilities

* [ ] **08 — Backend from scratch**

  * Database schema
  * Relationships
  * Constraints
  * API structure
  * Validation
  * Authentication
  * Authorization
  * Error handling
  * File/image storage
  * Business logic
  * Logging

* [ ] **09 — Build the product**

  * Authentication flow
  * Main application
  * Product/medicine functionality
  * Admin functionality
  * Customer functionality
  * Orders/transactions if required
  * Notifications if required
  * Settings/account
  * Every feature based on actual requirements

* [ ] **10 — Integration**

  * Connect frontend → API → database
  * Replace development data
  * Handle loading/error/empty states
  * Handle offline/network failures
  * Verify authorization boundaries

* [ ] **11 — Testing & quality**

  * Typecheck
  * Lint
  * Unit tests
  * Integration tests
  * Critical flow tests
  * Error cases
  * Permission tests
  * Regression testing

* [ ] **12 — Performance / APK discipline**

  * Audit dependencies
  * Audit native modules
  * Compress/optimize assets
  * Remove unused assets
  * Remove unnecessary fonts
  * Audit bundle
  * Test release build
  * Measure APK/AAB size
  * Check startup performance
  * Check memory usage
  * Check animation performance

* [ ] **13 — EAS production**

  * Configure EAS
  * Android application configuration
  * Production environment variables
  * Production build profile
  * Build AAB/APK
  * Install on physical device
  * Test release behavior
  * Verify final size

* [ ] **14 — Final product polish**

  * UI consistency audit
  * Interaction audit
  * Accessibility audit
  * Performance audit
  * Security audit
  * Remove development leftovers
  * Final Git cleanup
  * Release documentation

The important sequence is:

**Brand → Tokens → UI primitives → UI system → Physics → Architecture → Backend → Features → Integration → Testing → EAS → Optimization → Release**



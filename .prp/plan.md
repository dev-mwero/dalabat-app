# Vite to Next.js 16 Migration Plan (Feature-Parity First)

## 1. Scope And Objectives
- Source app: root Vite React marketplace app.
- Target app: `next-app` as an independent repository.
- Primary objective: strict UI and behavior parity first.
- Required stack in target: Next.js 16 (App Router), shadcn/ui + Tailwind, MongoDB + Mongoose, Clerk auth.
- Delivery model: fine-grained, atomic feature commits (one feature concern per commit).

## 2. Confirmed Product Decisions (From Quiz)
- Parity mode: strict parity first, enhancements later.
- Data bootstrap: include seed scripts from existing mock data.
- Vendor access policy (phase 1): authenticated users only.
- Commit granularity: fine-grained.

## 3. Current-State Summary
### Root Vite app already includes
- Customer flows:
  - Marketplace home discovery.
  - Vendor storefront.
  - Checkout with multiple payment modes.
  - Track-order experience.
- Vendor flows:
  - Dashboard, inventory, orders, analytics, settings.
- Shared UI/state:
  - shadcn-style UI and Radix primitives.
  - Cart context and drawer/modal interactions.
  - Charts, filters, search, sorting, pagination.
- Data source:
  - Mock data files (vendors/products/reviews/vendor dashboard data).

### `next-app` currently includes
- Minimal Next.js scaffold only (layout/page/globals).
- No migrated features, no API layer, no auth, no database models.

## 4. Execution Principles
- Treat `next-app` as fully independent repo (its own git history and commits).
- Keep commits atomic and deploy-safe when possible.
- Preserve feature behavior before refactoring architecture.
- Use App Router conventions and verify against current Next.js 16 docs.
- Introduce Clerk + Mongo in parity-oriented way (no broad product redesign in first pass).

## 5. Phased Implementation Plan

## Phase 0: Independent Repo Setup
1. Initialize git repository inside `next-app`.
2. Add repo docs for workflow, env setup, and commit conventions.
3. Ensure local scripts support lint/typecheck/build/test.
4. Record branch strategy:
   - `main`: stable parity baseline.
   - short-lived feature branches per commit group.

Deliverable:
- Independent `next-app` repo with baseline developer workflow.

## Phase 1: Foundation And Tooling (Blocker Phase)
1. Dependency alignment in `next-app/package.json`:
   - shadcn/Radix ecosystem used by source app.
   - React Query, Framer Motion, Recharts, Sonner.
   - React Hook Form + Zod + resolver.
   - clsx/cva/tailwind-merge/lucide-react and related utilities.
2. Tailwind/theme token migration:
   - Port relevant design tokens/colors/spacing from source styles into `src/app/globals.css`.
3. App-wide provider composition in `src/app/layout.tsx`:
   - Clerk provider.
   - React Query provider.
   - toast provider.
   - cart provider boundary.
4. Global app safety surfaces:
   - `not-found.tsx`, route-level error handling as needed.

Deliverable:
- Feature-ready shell for route/page migration.

## Phase 2: MongoDB + Mongoose Domain Layer
1. Add MongoDB connection helper with safe singleton/pooling.
2. Define models and types:
   - User, Vendor, Product, Review, Order.
3. Map parity fields from source app structures.
4. Add schema constraints/indexes needed for query behavior.
5. Add seed infrastructure:
   - deterministic seed scripts for vendors/products/reviews and baseline orders/settings if needed.

Deliverable:
- Persistent backend data layer ready for API routes.

## Phase 3: Clerk Authentication And Access Control
1. Integrate Clerk with Next.js 16 route protection approach.
2. Enforce policy:
   - Vendor area requires authenticated user.
3. Sync Clerk user records to Mongo User model.
4. Keep role-based vendor/admin authorization as post-parity extension (not phase-1 blocker).

Deliverable:
- Authenticated app foundation, vendor area protected.

## Phase 4: API Surface For Parity
1. Build route handlers for:
   - vendors
   - products
   - reviews
   - orders/checkout/tracking
   - vendor settings/dashboard aggregates
2. Preserve source behavior for:
   - filtering, sorting, pagination, search, status filters.
3. Add consistent response/error format and basic server logging.
4. Validate payloads with Zod at API boundaries.

Deliverable:
- API contracts backing all parity UI flows.

## Phase 5: Route And UI Migration (App Router)
1. Public/customer routes:
   - `/`
   - `/store/[vendorId]`
   - `/checkout`
   - `/track-order`
   - `not-found`
2. Vendor routes (nested layout):
   - `/vendor/dashboard`
   - `/vendor/inventory`
   - `/vendor/orders`
   - `/vendor/analytics`
   - `/vendor/settings`
3. Port shared components and adapt routing APIs:
   - replace react-router usage with `next/link`, `next/navigation`.
4. Preserve parity for:
   - cart behavior (single-vendor constraints), modals/drawers, toasts, empty/loading states.

Deliverable:
- Full route-level feature parity in Next.js frontend.

## Phase 6: Data Wiring And Behavior Parity Validation
1. Remove direct mock imports from runtime UI paths.
2. Wire UI to API with React Query.
3. Validate critical parity flows:
   - browse -> add to cart -> checkout -> track order
   - sign in -> vendor inventory update -> order status progression

Deliverable:
- Fully wired Next.js app with parity behavior on persistent data.

## Phase 7: Testing And Release Hardening
1. Add unit/component tests for high-risk logic:
   - cart totals/quantities
   - checkout validation
   - order state transitions
   - inventory CRUD behavior
2. Add integration coverage for customer and vendor critical paths.
3. Run and stabilize:
   - lint
   - typecheck
   - build
   - tests
4. Complete parity checklist against root Vite app screen-by-screen.

Deliverable:
- Stable parity release candidate.

## 6. Fine-Grained Commit Plan (Independent `next-app` Repo)
1. `chore(repo): initialize independent next-app workflow and docs`
2. `feat(ui-foundation): install and configure shadcn/radix/tailwind baseline`
3. `feat(providers): add clerk/query/toast/cart provider composition`
4. `feat(db): add mongoose connection utility and db config`
5. `feat(models): add user and vendor models`
6. `feat(models): add product and review models`
7. `feat(models): add order model with status/payment enums`
8. `feat(seed): add deterministic mongodb seed scripts from root mock data`
9. `feat(auth): integrate clerk and protect vendor routes for authenticated users`
10. `feat(api): add vendors and products endpoints`
11. `feat(api): add checkout/orders/tracking endpoints`
12. `feat(api): add reviews/settings/dashboard aggregate endpoints`
13. `feat(route): migrate marketplace home page`
14. `feat(route): migrate vendor storefront dynamic route`
15. `feat(route): migrate checkout flow`
16. `feat(route): migrate track-order flow`
17. `feat(route): add vendor layout and navigation shell`
18. `feat(route): migrate vendor dashboard`
19. `feat(route): migrate vendor inventory`
20. `feat(route): migrate vendor orders and checklist`
21. `feat(route): migrate vendor analytics`
22. `feat(route): migrate vendor settings`
23. `test(parity): add and stabilize critical flow tests`
24. `chore(release): parity checklist, docs, and release readiness`

## 7. Risk Register And Mitigations
- Risk: route behavior drift during router migration.
  - Mitigation: migrate route-by-route with parity acceptance checklist.
- Risk: data shape mismatch between mock and mongo models.
  - Mitigation: central shared TypeScript domain types + zod contracts.
- Risk: auth integration changing vendor UX unexpectedly.
  - Mitigation: keep authenticated-only policy in phase 1 and avoid role gating until post-parity.
- Risk: hydration/client boundary issues in highly interactive UI.
  - Mitigation: isolate client components deliberately and test each interactive page.

## 8. Definition Of Done (Parity Release)
- All customer and vendor routes available in `next-app`.
- Core interactions match source app behavior.
- Data persisted in MongoDB (not in-memory mocks).
- Clerk authentication active with authenticated vendor route protection.
- Seed scripts produce usable starter dataset.
- Lint/typecheck/build/tests pass.
- Independent next-app git history reflects feature-by-feature commits.

## 9. Open Questions For Implementation Start
- Should payment execution remain mock-only in parity release, or integrate real M-Pesa in same cycle?
- For authenticated vendor area, should any signed-in user access all vendor views in phase 1, or should we map user->vendor ownership immediately?
- Do we want optional localStorage cart persistence retained alongside DB-backed orders in parity release?

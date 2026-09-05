# IIBSO

Everyday provisions marketplace for Kenyan neighbourhoods. Buyers shop from local stores and mtaa merchants, pay cash on delivery or by M-Pesa, and track their order; vendors and tellers run their storefront through portal dashboards.

## Stack

- **Framework** — Next.js 16 App Router, React 19, TypeScript
- **Data** — MongoDB via Mongoose
- **Auth** — Clerk (role claims drive router-level authorisation)
- **Data fetching** — TanStack Query on the client, REST API routes server-side
- **UI** — Tailwind CSS v4, Radix primitives (shadcn-style), lucide icons, framer-motion
- **Tokens** — oklch design tokens in `src/app/globals.css` (warm-orange primary on cool neutrals) with a Fraunces `font-display` face for headings
- **Quality** — Biome (lint + format), Vitest, `tsc --noEmit`, GitHub Actions CI

## Getting started

```bash
npm install
cp .env.example .env.local   # add real credentials
npm run dev
```

Prerequisites: Node 22. For full functionality you need a Mongo database and a Clerk application; the app itself boots without them.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Mongo connection string |
| `MONGODB_DB` | Database name (defaults to the URI path in `src/lib/mongodb.ts`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk API secret |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Clerk route overrides |
| `NEXT_PUBLIC_APP_URL` | Canonical base URL for invitation links |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | Biome checks |
| `npm run format` | Biome formatting |
| `npm test` | Vitest unit tests (pure helpers) |
| `npm run seed` | Seed the database |
| `npm run seed:reset` | Reset and reseed |

## Roles and authorisation

Users are provisioned from Clerk and matched to `User` records with a `role`: `admin`, `teller`, `vendor`, or `customer`. Route protection lives in `src/lib/roles.ts`:

- `auth.protect()` guards every page; a public-route whitelist in `src/proxy.ts` (login-less pages, shopfronts, tracking) is the only exception.
- Server layouts call `requireRole([...])` to redirect users who lack the portal role — no role goes to `/sign-in`, wrong role goes to `/dashboard`.
- `getCurrentUserIdentity()` resolves the session to a `User` document so API routes can scope queries and enforce ownership.

Portals:

- **Admin** (`(admin)`) — vendor lifecycle, user and settings stubs, analytics.
- **Vendor** (`vendor`) — storefront dashboard, inventory, orders, staff, settings, analytics.
- **Teller** (`(teller)`) — orders and inventory for an invited store member; accessible to both `teller` and `vendor` roles.

Each group has its own layout with a client sidebar.

## Product surface

Buyer-facing routes are public, so shopfronts open to everyone:

- `/`, `/market` (filters: category deep-link, in-stock, free delivery), `/store/[slug]`
- `/vendors` directory (links into storefronts at `/store/[slug]`)
- `/track-order` + `/track` (public order tracking by ref)
- `/cart` + `/checkout` (cash, M-Pesa auto/STK, manual code)
- `/profile` (orders history — protected)

Registration is role-aware: `/register` picks buyer vs vendor, `/sign-up` carries `role` (and an optional `token`) through unsafe metadata to the provisioning webhook, and `/invite/[token]` forwards pending staff invitations to sign-up.

## API overview

Route handlers in `src/app/api` validate input with Zod and enforce ownership against the authenticated identity. The order lifecycle is the most safety-critical surface:

- `POST /api/orders` — creates an order; the customer is read from the session, never trusted from the payload. Manual M-Pesa payments with a transaction code are marked paid; everything else is pending.
- `GET /api/orders` — customers only see their own orders, tellers only their vendor&apos;s; unfiltered listing and cross-vendor reads are admin-only.
- `PATCH /api/orders/:id` — admin or the owning vendor only.
- `GET /api/track/:id` — public; returns order state and progress only, never contact details or pickup information.
- `GET|PATCH|DELETE /api/vendors/:id` — admin lifecycle and store-owner updates; deletion is refused while the store has orders.

Orders are addressable by Mongo id or by their human `DLB-xxxxxx` reference, which is stored in the notes field as `order-ref:<ref>`.

Additional handlers: `/api/products` (list/create + `/api/products/:id`), `/api/vendor/settings` and `/api/vendor/dashboard/summary` (storefront), `/api/user/me`, `/api/reviews`, `/api/vendor/staff/invite` (staff invitations), `/api/webhooks/clerk` (user provisioning from unsafe metadata).

## Structure

```
src/
├─ app/            # route groups + API handlers (RSC by default)
├─ components/     # UI components, portal sidebars, shadcn-style primitives (ui/)
├─ contexts/       # CartContext (single-vendor cart that clears when you add from another store)
├─ data/           # static seed data
├─ hooks/          # TanStack Query hooks (products, vendors, reviews)
├─ lib/            # config, roles, order domain helpers (unit-tested)
├─ models/         # Mongoose schemas
├─ providers/      # Clerk + Query root providers
├─ proxy.ts        # Clerk middleware with public-route whitelist
tests live alongside the code as `*.test.ts` (see src/lib).
scripts/           # seed.ts — database seeding/reset
```

## Development checks

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build
```

GitHub Actions runs this exact pipeline on push and pull request.

> Note: do not reinstall dependencies over a degraded network — the platform-native SWC binary for Next.js can download truncated and crash the build. If `next build` ever dies with a SIGBUS, restore `node_modules/@next/swc-linux-x64-gnu/next-swc.linux-x64-gnu.node`.
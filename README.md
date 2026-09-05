# IIBSO

Everyday provisions marketplace for Kenyan neighbourhoods. Buyers shop from local stores and mtaa merchants, pay cash on delivery or by M-Pesa, and track their order; vendors and tellers run their storefront through portal dashboards.

## Stack

- **Framework** — Next.js 16 App Router, React 19, TypeScript
- **Data** — MongoDB via Mongoose
- **Auth** — Clerk (role claims drive router-level authorisation)
- **Data fetching** — TanStack Query on the client, REST API routes server-side
- **UI** — Tailwind CSS v4, Radix primitives (shadcn-style), lucide icons, framer-motion
- **Quality** — Biome (lint + format), Vitest, `tsc --noEmit`

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
- Server layouts call `requireRole([...])` to redirect users who lack the portal role.
- `getCurrentUserIdentity()` resolves the session to a `User` document so API routes can scope queries and enforce ownership.

Admin and store portals live under `(admin)`, `(teller)`, and `vendor` route groups with their own layouts and client sidebars.

## API overview

Route handlers in `src/app/api` validate input with Zod and enforce ownership against the authenticated identity. The order lifecycle is the most safety-critical surface:

- `POST /api/orders` — creates an order; the customer is read from the session, never trusted from the payload. Manual M-Pesa payments with a transaction code are marked paid; everything else is pending.
- `GET /api/orders` — customers only see their own orders, tellers only their vendor&apos;s (admin bypasses).
- `PATCH /api/orders/:id` — admin or the owning vendor only.
- `GET /api/track/:id` — public; returns order state and progress only, never contact details or pickup information after completion.
- `GET|PATCH|DELETE /api/vendors/:id` — admin lifecycle and store-owner updates; deletion is refused while the store has orders.

Orders are addressable by Mongo id or by their human `DLB-xxxxxx` reference, which is stored in the notes field as `order-ref:<ref>`.

## Structure

```
src/
├─ app/            # route groups + API handlers (RSC by default)
├─ components/     # UI components, portals' client sidebars
├─ hooks/          # TanStack Query hooks
├─ lib/            # config, roles, order helpers (unit-tested)
└─ models/         # Mongoose schemas
```

## Development checks

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build
```

GitHub Actions runs this exact pipeline on push and pull request.

> Note: do not reinstall dependencies over a degraded network — the platform-native SWC binary for Next.js can download truncated and crash the build. If `next build` ever dies with a SIGBUS, restore `node_modules/@next/swc-linux-x64-gnu/next-swc.linux-x64-gnu.node`.
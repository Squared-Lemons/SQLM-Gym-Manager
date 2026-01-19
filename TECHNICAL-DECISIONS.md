# Technical Decisions

Quick reference for implementation decisions.

## Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Architecture | Monorepo (Turborepo) | Two apps sharing packages, independent deploys |
| Apps | `apps/owner`, `apps/member` | Clear separation, role-specific UX |
| Framework | Next.js 14+ (App Router) | SSR, API routes, server components |
| Auth | Better Auth + Organizations | Multi-tenancy, roles, social login |
| Database | SQLite + Drizzle | Simple, fast, type-safe, easy migration path |
| Styling | shadcn/ui + Tailwind | Theme support, accessible, consistent |
| Payments | Stripe (scaffolded) | Industry standard, webhook-based |
| Deployment | Vercel (recommended) | Native Next.js support, easy monorepo deploys |

## Monorepo Structure

```
gym-management/
├── apps/
│   ├── owner/              # Owner web app (Next.js)
│   │   ├── app/
│   │   │   ├── (auth)/     # Login, register
│   │   │   ├── (dashboard)/ # Protected routes
│   │   │   └── api/        # Owner-specific API routes
│   │   └── ...
│   └── member/             # Member web app (Next.js)
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (app)/      # Protected routes
│       │   └── api/        # Member-specific API routes
│       └── ...
├── packages/
│   ├── ui/                 # Shared UI components (shadcn)
│   ├── database/           # Drizzle schema, migrations, client
│   ├── auth/               # Better Auth config, middleware
│   ├── api/                # Shared API utilities, tenant context
│   └── typescript-config/  # Shared tsconfig
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

## Key Libraries

| Library | Purpose |
|---------|---------|
| `better-auth` | Authentication with organizations |
| `drizzle-orm` | Type-safe database queries |
| `drizzle-kit` | Database migrations |
| `@tanstack/react-query` | Client-side data fetching |
| `shadcn/ui` | UI component library |
| `tailwindcss` | Utility-first CSS |
| `stripe` | Payment processing |
| `zod` | Schema validation |
| `next-themes` | Theme switching (dark/light) |

## Database Schema (Core Tables)

```typescript
// packages/database/schema.ts

// Multi-tenancy
businesses           // Tenant (gym business)
gyms                 // Locations under a business

// Users & Auth
users                // All users (owners, members, trainers)
accounts             // OAuth accounts (Better Auth)
sessions             // Auth sessions (Better Auth)
organizations        // Better Auth organizations (= businesses)
organization_members // User-organization relationships

// Members
members              // Gym members (linked to users)
subscriptions        // Member subscription instances
check_ins            // QR code check-in records

// Classes
class_types          // Yoga, Spin, HIIT, etc.
class_schedules      // Scheduled class instances
class_bookings       // Member bookings

// Personal Training
trainers             // PT staff (linked to users)
trainer_availability // When trainers are available
pt_packages          // Session packages (5, 10 sessions)
pt_sessions          // Booked PT sessions

// Billing
subscription_plans   // Membership tiers (Basic, Premium)
payments             // Payment records
```

## Authentication Flow

### Owner Registration
1. User signs up → creates user record
2. Creates business (organization) → becomes owner
3. Adds first gym location
4. Session includes: `userId`, `businessId`, `role: owner`

### Member Registration
1. User signs up → creates user record
2. Links to gym (via invite code or selection)
3. Creates member record
4. Session includes: `userId`, `gymId`, `role: member`

### Session Context
```typescript
// packages/auth/context.ts
export type TenantContext = {
  userId: string
  role: 'owner' | 'member' | 'trainer'
  businessId?: string  // For owners
  gymId?: string       // For members/trainers
}
```

## API Security Pattern

### Middleware Stack
```typescript
// packages/api/middleware.ts

export const withAuth = (handler) => async (req) => {
  const session = await auth()
  if (!session) return unauthorized()
  return handler(req, session)
}

export const withOwner = (handler) => withAuth(async (req, session) => {
  if (session.role !== 'owner') return forbidden()
  const ctx = { businessId: session.businessId }
  return handler(req, session, ctx)
})

export const withMember = (handler) => withAuth(async (req, session) => {
  if (session.role !== 'member') return forbidden()
  const ctx = { gymId: session.gymId }
  return handler(req, session, ctx)
})
```

### Usage in Routes
```typescript
// apps/owner/app/api/members/route.ts
export const GET = withOwner(async (req, session, ctx) => {
  const members = await db.query.members.findMany({
    where: eq(members.businessId, ctx.businessId)
  })
  return Response.json(members)
})
```

## Theme Configuration

```typescript
// packages/ui/theme.ts
export const themes = {
  light: {
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    // ...shadcn variables
  },
  dark: {
    background: "222.2 84% 4.9%",
    foreground: "210 40% 98%",
    // ...
  }
}
```

Both apps use `next-themes` with shared color palette from `packages/ui`.

## Stripe Integration (v1)

### Scaffold Only
```typescript
// packages/api/stripe.ts
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Create customer when member joins
export const createCustomer = async (member: Member) => {
  return stripe.customers.create({
    email: member.email,
    metadata: { memberId: member.id, gymId: member.gymId }
  })
}

// Webhook endpoint (apps/owner/app/api/webhooks/stripe/route.ts)
// Handle: customer.created, payment_intent.succeeded, etc.
```

### v2 Additions (Later)
- Subscription creation
- Plan management via API
- Billing portal redirect
- Usage-based billing for PT sessions

## Environment Variables

```bash
# Database
DATABASE_URL="file:./local.db"

# Auth
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Apps
NEXT_PUBLIC_OWNER_APP_URL="http://localhost:3000"
NEXT_PUBLIC_MEMBER_APP_URL="http://localhost:3001"
```

## Deployment Strategy

### Vercel (Recommended)
- Connect GitHub repo
- Vercel auto-detects Turborepo
- Configure two projects: owner app, member app
- Shared environment variables
- SQLite → use Turso for production (or migrate to Postgres)

### Domains
- `app.gymmanager.com` → Owner app
- `members.gymmanager.com` → Member app
- Or: `gymmanager.com/owner`, `gymmanager.com/member` (single domain)

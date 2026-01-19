# Next.js App Build Guide

A comprehensive stack for building Next.js applications with authentication, database, and monorepo structure.

---

## Stack Overview

| Layer | Technology | Guide |
|-------|------------|-------|
| **Monorepo** | Turborepo + pnpm | [Turborepo Monorepo Setup](../../monorepo/turborepo/Turborepo-Monorepo-Setup.md) |
| **Database** | Drizzle ORM + SQLite | [Drizzle ORM Guide](../../database/drizzle/Drizzle-ORM-Guide.md) |
| **Auth** | Better Auth | [Better Auth Guide](../../auth/better-auth/Better-Auth-Guide.md) |
| **Server Logic** | Next.js Server Actions | [Server Actions Patterns](../../patterns/Server-Actions-Patterns.md) |
| **Route Protection** | Client-side guards | [Route Protection & Onboarding](../../patterns/Route-Protection-Onboarding.md) |
| **DX** | Handoffs, seed scripts | [Developer Experience Checklist](../../patterns/Developer-Experience-Checklist.md) |

---

## Performance Patterns (Critical)

These patterns have the highest impact on application performance. Follow them from the start.

### Eliminate Waterfalls

Waterfalls are the #1 performance killer. Each sequential `await` adds full network latency.

```typescript
// ❌ Incorrect: sequential (3 round trips)
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()

// ✅ Correct: parallel (1 round trip)
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

**In Server Components:** Use component composition to parallelize data fetching:

```tsx
// ❌ Sidebar waits for Page's fetch
export default async function Page() {
  const header = await fetchHeader()
  return <div><Header data={header} /><Sidebar /></div>
}

// ✅ Both fetch simultaneously
export default function Page() {
  return <div><Header /><Sidebar /></div>
}
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}
```

### Bundle Size

Avoid barrel file imports - they load thousands of unused modules:

```typescript
// ❌ Loads entire library (~200-800ms cold start cost)
import { Check, X } from 'lucide-react'

// ✅ Loads only what you need
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'

// Or configure Next.js to optimize automatically:
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@mui/material']
  }
}
```

Use `next/dynamic` for heavy components not needed on initial render:

```tsx
const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false }
)
```

### Server-Side Caching

Use `React.cache()` for per-request deduplication:

```typescript
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return await db.user.findUnique({ where: { id: session.user.id } })
})
// Multiple calls in same request = single query
```

Use `after()` for non-blocking operations:

```typescript
import { after } from 'next/server'

export async function POST(request: Request) {
  await updateDatabase(request)
  after(async () => {
    await logUserAction() // Runs after response sent
  })
  return Response.json({ status: 'success' })
}
```

### Suspense Boundaries

Show wrapper UI faster while data loads:

```tsx
function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<Skeleton />}>
        <DataDisplay />
      </Suspense>
      <Footer />
    </div>
  )
}
// Header and Footer render immediately
```

---

## UI/UX Checklist

Build accessible, responsive interfaces from the start.

### Accessibility
- [ ] All interactive elements reachable via keyboard
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Images have meaningful alt text
- [ ] Form inputs have associated labels

### Forms
- [ ] Clear error messages with guidance to fix
- [ ] Input validation on blur and submit
- [ ] Loading states on submit buttons
- [ ] Success confirmation after submission

### Performance
- [ ] Images use Next.js `<Image>` with proper sizing
- [ ] Long lists use `content-visibility: auto`
- [ ] Heavy components lazy-loaded with `next/dynamic`
- [ ] No layout shift (reserve space for async content)

### Responsive
- [ ] Works on mobile, tablet, desktop
- [ ] Touch targets minimum 44x44px on mobile
- [ ] No horizontal scroll on mobile

---

## Quick Start

### 1. Set Up Monorepo

Follow [Turborepo Monorepo Setup](../../monorepo/turborepo/Turborepo-Monorepo-Setup.md) to create:

```
project/
├── apps/web/           # Next.js app
├── packages/database/  # Drizzle schema
├── packages/auth/      # Better Auth config
├── packages/ui/        # Shared components
└── turbo.json
```

### 2. Configure Database

Follow [Drizzle ORM Guide](../../database/drizzle/Drizzle-ORM-Guide.md) for:
- Schema definition
- Migration setup
- Singleton pattern for dev
- Next.js configuration

### 3. Add Authentication

Follow [Better Auth Guide](../../auth/better-auth/Better-Auth-Guide.md) for:
- **Critical**: Singular table names (`user`, not `users`)
- Auth schema setup
- OAuth configuration
- Client/server setup

### 4. Build Features

Use [Server Actions Patterns](../../patterns/Server-Actions-Patterns.md) for:
- CRUD operations
- Auth checks
- Zod validation
- Error handling

### 5. Protect Routes

Use [Route Protection & Onboarding](../../patterns/Route-Protection-Onboarding.md) for:
- OnboardingCheck component
- Multi-step onboarding
- Layout protection

### 6. Prepare for Handoff

Use [Developer Experience Checklist](../../patterns/Developer-Experience-Checklist.md) for:
- SETUP.md template
- .env.example
- Seed scripts
- Feature status tracking

---

## Common Pitfalls Quick Reference

| Issue | Solution |
|-------|----------|
| Better Auth "model not found" | Use singular table names: `user`, `session`, `account` |
| OAuth button does nothing | Add `baseURL` to betterAuth() config |
| Env vars undefined in Next.js | Symlink `.env` to `apps/web/.env` |
| Database path wrong | Use `../../packages/...` relative to apps/web |
| better-sqlite3 errors | Add `serverExternalPackages` to next.config.js |

---

## When to Use Each Guide

| Scenario | Guides to Include |
|----------|-------------------|
| Full-stack app with auth | All guides |
| API-only backend | Drizzle, Server Actions |
| Static site with DB | Drizzle only |
| Auth without organizations | Better Auth (skip org sections) |
| Existing project, add auth | Better Auth, Route Protection |

---

## Skills for Deeper Learning

These agent skills provide comprehensive guidance on specific topics:

| Skill | What It Covers |
|-------|----------------|
| **vercel-react-best-practices** | 40+ performance rules: waterfalls, bundle size, server/client optimization, re-renders |
| **web-design-guidelines** | Complete UI/UX checklist: accessibility, forms, animations, dark mode, localization |
| **frontend-design** | Production-grade interface design with high polish |

To install skills: `npx add-skill [source] -s [skill-name]`

---

*Based on lessons learned from real projects. Each guide can be used independently.*

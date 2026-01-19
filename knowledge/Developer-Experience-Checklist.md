# Developer Experience Checklist

Checklists and templates for smooth project handoffs and developer onboarding.

---

## Pre-Development Setup

- [ ] `.env.example` file with all required variables documented
- [ ] Database seed script for initial data (`pnpm db:seed`)
- [ ] Clear README with quick start instructions
- [ ] All dependencies documented with versions

---

## During Development

- [ ] Loading states for async operations
- [ ] Error boundaries and fallback UI
- [ ] Form validation with Zod schemas
- [ ] Toast notifications for user feedback
- [ ] Consistent error handling patterns

---

## Before Handoff

- [ ] All environment variables documented
- [ ] OAuth setup instructions with redirect URIs
- [ ] Feature status table (working / in-progress / planned)
- [ ] Database migration scripts tested
- [ ] Seed data script for fresh environments
- [ ] Known issues documented

---

## Handoff Document Template

Create a `SETUP.md` with this structure:

```markdown
# Project Setup

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | How to Get |
|----------|-------------|------------|
| DATABASE_URL | SQLite database path | Default: `file:../../packages/database/data/app.db` |
| BETTER_AUTH_SECRET | Auth encryption key | Generate: `openssl rand -base64 32` |
| GOOGLE_CLIENT_ID | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com/) |
| GOOGLE_CLIENT_SECRET | Google OAuth secret | Same as above |
| NEXT_PUBLIC_APP_URL | App URL | `http://localhost:3000` for dev |

## OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Navigate to "APIs & Services" > "Credentials"
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URI: `{NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

## Installation

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Email/Password Auth | ✅ Working | - |
| Google OAuth | ✅ Working | Requires OAuth setup |
| Organization Management | ✅ Working | - |
| [Feature] | 🚧 In Progress | [Notes] |
| [Feature] | ⏳ Planned | [Notes] |

## Known Issues

- [Any known issues or gotchas]
```

---

## .env.example Template

```env
# Database
# Path relative to apps/web in monorepo
DATABASE_URL=file:../../packages/database/data/app.db

# Better Auth
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=

# Google OAuth (optional)
# Get from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Database Seed Script

```typescript
// packages/database/src/seed.ts
import { db } from "./index";
import { user, organization, member } from "./schema";
import { nanoid } from "nanoid";

async function seed() {
  console.log("Seeding database...");

  // Create test user
  const testUserId = nanoid();
  await db.insert(user).values({
    id: testUserId,
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
  });

  // Create test organization
  const testOrgId = nanoid();
  await db.insert(organization).values({
    id: testOrgId,
    name: "Test Organization",
    slug: "test-org",
  });

  // Add user as owner
  await db.insert(member).values({
    id: nanoid(),
    organizationId: testOrgId,
    userId: testUserId,
    role: "owner",
  });

  console.log("Seeding complete!");
  console.log("Test user: test@example.com");
}

seed().catch(console.error);
```

Add to package.json:

```json
{
  "scripts": {
    "db:seed": "tsx src/seed.ts"
  },
  "devDependencies": {
    "tsx": "^4.0.0"
  }
}
```

---

## Code Quality Patterns

### Zod Validation

```typescript
import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
```

### Error Handling in Actions

```typescript
export async function createItem(input: CreateItemInput) {
  try {
    const validated = createItemSchema.safeParse(input);
    if (!validated.success) {
      return { error: validated.error.flatten().fieldErrors };
    }

    // ... create item

    return { success: true };
  } catch (error) {
    console.error("Failed to create item:", error);
    return { error: "Failed to create item" };
  }
}
```

### Loading States

```tsx
"use client";

import { useTransition } from "react";

function MyForm() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await myServerAction(formData);
    });
  }

  return (
    <form action={handleSubmit}>
      <button disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

---

## Project Checklist

### Initial Setup

- [ ] Create monorepo structure (apps/, packages/)
- [ ] Configure pnpm-workspace.yaml
- [ ] Configure turbo.json
- [ ] Set up packages/database with Drizzle
- [ ] Set up packages/auth with Better Auth
- [ ] Set up packages/ui with shadcn
- [ ] Set up apps/web with Next.js

### Database Schema

- [ ] Create auth tables with **singular** names
- [ ] Create organization tables with **singular** names
- [ ] Export all schemas from packages/database/src/schema/index.ts
- [ ] Run db:generate and db:migrate

### Authentication

- [ ] Add `baseURL` to betterAuth() config
- [ ] Pass `schema` to drizzleAdapter
- [ ] Configure organization plugin with schema mapping
- [ ] Set up auth client with organizationClient plugin
- [ ] Create API route at apps/web/app/api/auth/[...all]/route.ts

### Environment

- [ ] Create .env in monorepo root
- [ ] Symlink .env to apps/web/.env
- [ ] Use correct relative path for DATABASE_URL
- [ ] Set up OAuth credentials (if using)

### Application

- [ ] Create onboarding flow
- [ ] Add OnboardingCheck component
- [ ] Wrap dashboard layout with OnboardingCheck
- [ ] Create server actions for CRUD operations
- [ ] Set up sidebar navigation
- [ ] Set up header with user menu

---

## Quick Reference: Key File Locations

```
packages/database/src/schema/auth.ts      # Auth tables (singular names!)
packages/database/src/schema/index.ts     # Schema exports
packages/auth/src/index.ts                # Better Auth server config
packages/auth/src/client.ts               # Better Auth client
apps/web/app/api/auth/[...all]/route.ts   # Auth API route
apps/web/lib/actions/*.ts                 # Server actions
apps/web/components/onboarding-check.tsx  # Route protection
```

---

*See also: [Server Actions Patterns](Server-Actions-Patterns.md), [Better Auth Guide](../auth/better-auth/Better-Auth-Guide.md)*

# Better Auth Guide

A guide for setting up Better Auth with Drizzle ORM, including OAuth and organization support.

---

## Critical Requirements

> **IMPORTANT**: Better Auth expects **singular** table names. This is non-negotiable.

| Expected Table | NOT This |
|---------------|----------|
| `user` | `users` |
| `session` | `sessions` |
| `account` | `accounts` |
| `verification` | `verifications` |
| `organization` | `organizations` |
| `member` | `organization_members` |

---

## Auth Schema

```typescript
// packages/database/src/schema/auth.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// SINGULAR table names required by Better Auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});
```

---

## Organization Schema

```typescript
// packages/database/src/schema/organizations.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// SINGULAR table name required by Better Auth organization plugin
export const organization = sqliteTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// SINGULAR table name - "member" not "members" or "organization_members"
export const member = sqliteTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  role: text("role", { enum: ["owner", "admin", "member"] })
    .notNull()
    .default("member"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
}));
```

---

## Auth Server Configuration

```typescript
// packages/auth/src/index.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db } from "@app/database";
import * as schema from "@app/database/schema";

export const auth = betterAuth({
  // REQUIRED: baseURL is needed for OAuth callbacks
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // REQUIRED: Pass schema to adapter for table recognition
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,  // <-- Don't forget this!
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      // REQUIRED: Map to your schema's model names
      schema: {
        organization: {
          modelName: "organization",
        },
        member: {
          modelName: "member",
        },
      },
    }),
  ],

  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

---

## Auth Client

```typescript
// packages/auth/src/client.ts
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  useActiveOrganization,
  organization,
} = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [organizationClient()],
});
```

---

## API Route

```typescript
// apps/web/app/api/auth/[...all]/route.ts
import { auth } from "@app/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

---

## Social Provider Buttons

When social providers are configured, you must manually add buttons:

```tsx
import { signIn } from "@app/auth/client";

function LoginForm() {
  return (
    <div className="space-y-4">
      {/* Email/password form fields */}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn.social({ provider: "google" })}
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
}
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Navigate to "APIs & Services" > "Credentials"
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URI: `{NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
6. Copy Client ID and Secret to .env

---

## Environment Variables

```env
# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "better-sqlite3",
    "better-auth",
    "@app/auth",
    "@app/database",
  ],

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        "better-sqlite3": "commonjs better-sqlite3",
      });
    }
    return config;
  },
};

export default nextConfig;
```

---

## Getting Session in Server Actions

```typescript
"use server";

import { auth } from "@app/auth";
import { headers } from "next/headers";

export async function myServerAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Get active organization
  const activeOrg = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  // ... rest of action
}
```

---

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| OAuth button does nothing | Missing `baseURL` | Add `baseURL` to betterAuth() config |
| "model not found" error | Plural table names | Use singular: `user`, `session`, `account`, `verification` |
| "model not found" for org | Wrong table names | Use `organization` and `member` (singular) |
| Schema not recognized | Schema not passed | Add `schema` to drizzleAdapter options |
| Social login no buttons | UI doesn't auto-generate | Manually add social provider buttons |

---

*See also: [Drizzle ORM Guide](../../database/drizzle/Drizzle-ORM-Guide.md), [Server Actions Patterns](../../patterns/Server-Actions-Patterns.md)*

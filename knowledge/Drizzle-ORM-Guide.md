# Drizzle ORM Guide

A guide for setting up Drizzle ORM with SQLite (better-sqlite3) in a monorepo.

---

## Package Setup

```json
{
  "name": "@app/database",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/index.ts"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "better-sqlite3": "^11.7.0",
    "drizzle-orm": "^0.38.3"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.12",
    "drizzle-kit": "^0.30.1",
    "tsup": "^8.3.5"
  }
}
```

---

## drizzle.config.ts

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:./data/app.db",
  },
});
```

---

## Database Client

```typescript
// packages/database/src/index.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Singleton pattern for development (prevents multiple connections during hot reload)
const globalForDb = globalThis as unknown as {
  sqlite: Database.Database | undefined;
};

const sqlite =
  globalForDb.sqlite ??
  new Database(
    process.env.DATABASE_URL?.replace("file:", "") || "./data/app.db"
  );

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
export * from "./schema";
```

---

## Schema Organization

```typescript
// packages/database/src/schema/index.ts
export * from "./users";
export * from "./posts";
export * from "./comments";
// ... etc
```

### Example Table

```typescript
// packages/database/src/schema/users.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

### Relations

```typescript
import { relations } from "drizzle-orm";
import { users } from "./users";
import { posts } from "./posts";

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

---

## Database Reset Workflow

When you need a completely fresh database:

```bash
# 1. Remove existing database and migrations
rm packages/database/data/app.db
rm -rf packages/database/drizzle/*

# 2. Generate fresh migrations (no rename prompts)
pnpm db:generate

# 3. Apply migrations
pnpm db:migrate

# 4. Start dev server
pnpm dev
```

---

## Seed Script

```typescript
// packages/database/src/seed.ts
import { db } from "./index";
import { users } from "./schema";
import { nanoid } from "nanoid";

async function seed() {
  console.log("Seeding database...");

  await db.insert(users).values({
    id: nanoid(),
    name: "Test User",
    email: "test@example.com",
  });

  console.log("Seeding complete!");
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

## Next.js Configuration

> **IMPORTANT**: Native modules like better-sqlite3 need special handling in Next.js.

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent native modules from being bundled
  serverExternalPackages: [
    "better-sqlite3",
    "@app/database",
  ],

  // Webpack externals for better-sqlite3
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

## Environment Variables

> **IMPORTANT**: Next.js only loads `.env` from its own directory, not the monorepo root.

### Solution: Symlink

```bash
# From apps/web directory
ln -s ../../.env .env
```

### DATABASE_URL Path Resolution

Relative paths resolve from where the app runs (apps/web):

```env
# WRONG - resolves to apps/web/packages/database/data/app.db
DATABASE_URL=file:./packages/database/data/app.db

# CORRECT - resolves to packages/database/data/app.db
DATABASE_URL=file:../../packages/database/data/app.db
```

---

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Migration prompts | Renaming tables | Delete db + drizzle folder, regenerate fresh |
| Table not found | Schema export missing | Check src/schema/index.ts exports |
| Database not found | Wrong relative path | Use `../../packages/...` from apps/web |
| Cannot find better-sqlite3 | Webpack bundling | Add serverExternalPackages + webpack config |
| Multiple db connections | No singleton | Use globalThis pattern in development |

---

*See also: [Turborepo Monorepo Setup](../../monorepo/turborepo/Turborepo-Monorepo-Setup.md), [Better Auth Guide](../../auth/better-auth/Better-Auth-Guide.md)*

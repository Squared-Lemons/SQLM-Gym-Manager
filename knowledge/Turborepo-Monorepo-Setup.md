# Turborepo Monorepo Setup

A guide for setting up a Turborepo monorepo with pnpm workspaces.

---

## Structure

```
project/
├── apps/
│   └── web/                    # Next.js application
│       ├── app/                # App Router
│       ├── components/         # App-specific components
│       ├── lib/                # Utilities, actions
│       └── package.json
├── packages/
│   ├── database/               # Database schema & client
│   ├── auth/                   # Authentication configuration
│   ├── ui/                     # Shared UI components (shadcn)
│   └── config/                 # Shared configs (typescript, tailwind)
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## Root package.json

```json
{
  "name": "my-app",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "db:generate": "turbo db:generate",
    "db:migrate": "turbo db:migrate",
    "db:push": "turbo db:push",
    "db:studio": "pnpm --filter @app/database db:studio",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.3.3",
    "typescript": "^5.7.2"
  },
  "packageManager": "pnpm@9.15.0"
}
```

---

## pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    }
  }
}
```

---

## Package Naming Convention

Use a consistent namespace for internal packages:

```json
// packages/database/package.json
{
  "name": "@app/database"
}

// packages/auth/package.json
{
  "name": "@app/auth"
}

// packages/ui/package.json
{
  "name": "@app/ui"
}
```

Reference in apps:

```json
// apps/web/package.json
{
  "dependencies": {
    "@app/database": "workspace:*",
    "@app/auth": "workspace:*",
    "@app/ui": "workspace:*"
  }
}
```

---

## UI Package with shadcn

```json
{
  "name": "@app/ui",
  "version": "0.0.1",
  "exports": {
    ".": "./src/index.ts",
    "./globals.css": "./src/globals.css"
  },
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.469.0",
    "tailwind-merge": "^2.6.0"
  }
}
```

### Re-export Pattern

```typescript
// packages/ui/src/index.ts
export { cn } from "./lib/utils";
export { Button, buttonVariants } from "./components/button";
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/card";
export { Input } from "./components/input";
export { Label } from "./components/label";
// ... etc
```

---

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Package not found | Missing workspace dep | Add `@app/package: workspace:*` to package.json |
| Types not resolving | Missing build step | Run `turbo build` or add tsup to package |
| Dev server slow | Cache issues | Run `turbo clean` |

---

*See also: [Drizzle ORM Guide](../../database/drizzle/Drizzle-ORM-Guide.md), [Better Auth Guide](../../auth/better-auth/Better-Auth-Guide.md)*

# Gym Management SaaS

A multi-tenant Gym Management SaaS with two Next.js apps (Owner and Member) sharing common packages.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up database
pnpm db:generate
pnpm db:migrate

# (Optional) Seed with demo data
pnpm db:seed

# Start both apps
pnpm dev

# Or start individually:
pnpm dev:owner  # http://localhost:3000
pnpm dev:member # http://localhost:3001
```

## Project Structure

```
gym-management/
├── apps/
│   ├── owner/          # Gym Owner Dashboard (port 3000)
│   └── member/         # Member App (port 3001)
├── packages/
│   ├── database/       # Drizzle ORM + SQLite schema
│   ├── auth/           # Better Auth configuration
│   ├── ui/             # shadcn/ui components
│   ├── api/            # Shared utilities
│   └── typescript-config/
├── .env                # Environment variables
├── turbo.json          # Turborepo configuration
└── pnpm-workspace.yaml
```

## Environment Variables

Create `.env` in the root (or copy from `.env.example`):

```env
DATABASE_URL=file:../../packages/database/data/app.db
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_OWNER_APP_URL=http://localhost:3000
NEXT_PUBLIC_MEMBER_APP_URL=http://localhost:3001
```

Create symlinks in each app directory:
```bash
cd apps/owner && ln -s ../../.env .env
cd apps/member && ln -s ../../.env .env
```

## Key Technologies

- **Framework**: Next.js 15 (App Router)
- **Monorepo**: Turborepo + pnpm workspaces
- **Database**: SQLite with Drizzle ORM
- **Auth**: Better Auth with Organizations plugin
- **UI**: shadcn/ui + Tailwind CSS

## Database Commands

```bash
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Apply migrations
pnpm db:push      # Push schema changes (dev)
pnpm db:studio    # Open Drizzle Studio
pnpm db:seed      # Seed demo data
```

## Architecture Notes

### Multi-tenancy
- Uses Better Auth Organizations plugin
- Each organization owns a Business
- Each Business can have multiple Gyms
- Gym Members belong to a specific Gym

### Table Naming Convention
Better Auth requires **singular** table names:
- `user`, `session`, `account`, `verification`
- `organization`, `member` (org membership)

### Native Module Handling
SQLite (better-sqlite3) requires special Next.js config:
```javascript
// next.config.js
serverExternalPackages: ["better-sqlite3", "@app/database"],
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals.push({ "better-sqlite3": "commonjs better-sqlite3" });
  }
  return config;
},
```

## Owner App Features

- Auth: Login, Signup, Onboarding
- Dashboard with stats
- Gym management (CRUD)
- Member management (CRUD + QR codes)
- Class types and schedules
- Trainer management
- Subscription plans & PT packages
- Payment tracking

## Member App Features

- Auth: Login, Signup
- Link existing membership via member number
- QR code display for gym check-in
- Class browsing and booking
- Trainer directory
- Profile management

## Demo Credentials

After running `pnpm db:seed`:
- Owner email: `owner@demo.com`
- Creates: 1 business, 2 gyms, 3 members, 2 trainers, classes, etc.

## Development Tips

1. **Database Reset**: Delete `packages/database/data/app.db` and `packages/database/drizzle/*`, then regenerate

2. **Type Checking**: Run `pnpm type-check` to check all packages

3. **Adding UI Components**: Components are in `packages/ui/src/components/`

4. **Server Actions**: Located in `apps/*/lib/actions/`

## File Locations

| Resource | Location |
|----------|----------|
| Database schema | `packages/database/src/schema/` |
| Auth config | `packages/auth/src/` |
| UI components | `packages/ui/src/components/` |
| Owner pages | `apps/owner/app/` |
| Member pages | `apps/member/app/` |
| Server actions | `apps/*/lib/actions/` |

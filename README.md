# SQLM - Gym Manager

> This project is an example application spawned by a coding agent from the [Squared Agent Master Project](https://github.com/Squared-Lemons). It demonstrates autonomous code generation and full-stack application development using AI-driven workflows.

## Overview

A multi-tenant Gym Management SaaS platform consisting of two Next.js applications:

- **Owner App** - Dashboard for gym owners to manage their business, members, classes, and trainers
- **Member App** - Mobile-friendly app for gym members to view schedules, book classes, and manage their membership

## Features

### Owner Dashboard
- Business and gym management (multi-location support)
- Member management with QR code generation
- Class types and scheduling
- Trainer management
- Subscription plans and PT packages
- Payment tracking

### Member App
- Membership linking via member number
- QR code display for gym check-in
- Class browsing and booking
- Trainer directory
- Profile management

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Monorepo**: Turborepo + pnpm workspaces
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Better Auth with Organizations plugin
- **UI**: shadcn/ui + Tailwind CSS
- **Language**: TypeScript

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
```

- Owner App: http://localhost:3000
- Member App: http://localhost:3001

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

## Environment Setup

Create `.env` in the root directory:

```env
DATABASE_URL=file:../../packages/database/data/app.db
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_OWNER_APP_URL=http://localhost:3000
NEXT_PUBLIC_MEMBER_APP_URL=http://localhost:3001
```

## Database Commands

```bash
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Apply migrations
pnpm db:push      # Push schema changes (dev)
pnpm db:studio    # Open Drizzle Studio
pnpm db:seed      # Seed demo data
```

## Demo

After running `pnpm db:seed`:
- Owner email: `owner@demo.com`
- Creates: 1 business, 2 gyms, 3 members, 2 trainers, sample classes, and more

## Architecture

### Multi-tenancy Model
- Organizations own Businesses
- Businesses can have multiple Gyms
- Members belong to specific Gyms

### Shared Packages
All common functionality is extracted into shared packages for code reuse between the Owner and Member apps.

## License

MIT

---

Built with [Squared Agent Master Project](https://github.com/Squared-Lemons)

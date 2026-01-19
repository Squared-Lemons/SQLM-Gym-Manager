# Project Learnings

## 2025-01-19 - Initial Project Setup

### What Worked Well

**Monorepo Structure**
- Turborepo + pnpm workspaces provides clean package separation
- Shared packages (`ui`, `database`, `auth`, `api`) reduce code duplication
- Workspace dependencies (`workspace:*`) keep versions in sync

**Better Auth with Organizations**
- Organizations plugin handles multi-tenancy elegantly
- Singular table names (`user`, `session`, `member`) required by Better Auth
- Organization membership ties users to businesses naturally

**SQLite with Drizzle**
- Single-file database simplifies development
- Drizzle's type-safe queries catch errors at compile time
- Schema exports work well across packages

**shadcn/ui Components**
- Quick to add components as needed
- Consistent styling out of the box
- Easy to customize via Tailwind

### What Didn't Work

**Native Module Handling**
- `better-sqlite3` requires special webpack configuration in Next.js
- Must add to `serverExternalPackages` in next.config.js
- Database package must also be externalized

### Technical Insights

**Environment Variables**
- Root `.env` file with symlinks in each app works well
- `DATABASE_URL` must use relative path from app directory (`file:../../packages/database/data/app.db`)
- `BETTER_AUTH_SECRET` must be generated for production

**Package Structure**
- `@app/*` namespace for internal packages keeps imports clean
- Each package needs its own `package.json` with proper exports
- TypeScript config inheritance via `@app/typescript-config`

### Process Improvements

**Documentation**
- CLAUDE.md created upfront saves context for future sessions
- PROJECT-BRIEF.md and TECHNICAL-DECISIONS.md preserved original requirements
- File location table in CLAUDE.md helps navigate the codebase

### Known Limitations (v1)

- Payments are scaffolded but not fully wired to Stripe
- No real-time notifications yet
- PT session booking UI is basic
- No attendance tracking visualization

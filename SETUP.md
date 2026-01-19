# Project Setup

This folder contains everything needed to build the Gym Management System.

## What's Included

- **.claude/commands/** - Slash commands for development workflow
- **PROJECT-BRIEF.md** - Full project context and requirements
- **TECHNICAL-DECISIONS.md** - Technology choices with rationale
- **knowledge/** - Platform-specific guidance and patterns
- **commands/** - Workflow documentation (reference)
- **provided-files/** - Original spec from the user

## Skills to Install

These skills provide implementation guidance. Install during setup:

```bash
# Better Auth guidance
npx add-skill better-auth/skills

# Vercel performance patterns + UI guidelines
npx add-skill vercel-labs/agent-skills

# Production-grade UI design
npx add-skill anthropics/skills -s frontend-design

# Theme generation
npx add-skill anthropics/skills -s theme-factory
```

## Available Commands

After opening in Claude Code, these commands are available:

| Command | Purpose |
|---------|---------|
| `/start-session` | Begin session with branch safety check |
| `/new-feature` | Create feature branch for safe development |
| `/complete-feature` | Merge or create PR when done |
| `/commit` | Draft commit message and commit changes |
| `/end-session` | Update docs, capture learnings, commit |
| `/summary` | Generate accomplishments report |

## For the Target Agent

Read these files in order:

1. **PROJECT-BRIEF.md** - Understand what we're building and why
2. **TECHNICAL-DECISIONS.md** - Understand the technical approach
3. **knowledge/*.md** - Learn platform patterns and gotchas

Then:

1. Enter plan mode to design the implementation
2. Create the monorepo structure (Turborepo + pnpm)
3. Set up packages: `ui`, `database`, `auth`, `api`
4. Create apps: `owner`, `member`
5. Implement database schema first
6. Set up Better Auth with organizations
7. Build core features from the brief
8. Create CLAUDE.md documenting the project

## Implementation Order (Suggested)

### Phase 1: Foundation
1. Monorepo setup (Turborepo, pnpm workspace)
2. Shared packages structure
3. Database schema + Drizzle setup
4. Better Auth configuration
5. Basic UI package with shadcn

### Phase 2: Owner App Core
1. Auth pages (login, register)
2. Business onboarding flow
3. Gym management (CRUD)
4. Dashboard layout

### Phase 3: Member Management
1. Member CRUD in owner app
2. QR code generation
3. Member app auth
4. Member dashboard with QR display

### Phase 4: Classes
1. Class types management
2. Schedule creation
3. Member booking flow
4. Attendance tracking

### Phase 5: Personal Training
1. Trainer management
2. PT packages
3. Session booking
4. Session tracking

### Phase 6: Payments
1. Stripe webhook setup
2. Customer creation
3. Payment recording
4. (Plans wired later)

## CLAUDE.md Requirements

When creating CLAUDE.md, include these sections:

### Project Overview
```markdown
## Project Overview

Gym Management SaaS with two apps:
- **Owner App** (`apps/owner`) - Gym owners manage business, members, classes, PTs
- **Member App** (`apps/member`) - Members book classes, view membership, check-in

Shared packages: `ui`, `database`, `auth`, `api`
```

### Browser Automation (required)
```markdown
## Browser Automation

**Default:** Use `claude-in-chrome` (mcp__claude-in-chrome__*) for all browser testing.

**Key tools:**
- `tabs_context_mcp` - Get current tabs (call first)
- `tabs_create_mcp` - Create new tab
- `read_page` - Get page structure with element refs
- `computer` - Click, type, screenshot
- `navigate` - Go to URL

**Pattern:**
1. Call `tabs_context_mcp` to see existing tabs
2. Create new tab with `tabs_create_mcp`
3. Navigate and interact
```

### Development Commands
```markdown
## Commands

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm dev --filter owner` | Start owner app only |
| `pnpm dev --filter member` | Start member app only |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type check all packages |
```

## Verification Checklist

After setup, verify:
- [ ] Monorepo structure with Turborepo
- [ ] Both apps start (`pnpm dev`)
- [ ] Database schema created
- [ ] Better Auth working (can register/login)
- [ ] Owner can create business and gym
- [ ] Member can register and link to gym
- [ ] Theme switching works
- [ ] CLAUDE.md created
- [ ] Git repository initialized

## Post-Setup Cleanup

After the project has been successfully built and verified, consolidate all setup documentation into the project:

```bash
mkdir -p agent/setup
mv ../SETUP.md ../PROJECT-BRIEF.md ../TECHNICAL-DECISIONS.md agent/setup/
mv ../commands ../knowledge ../provided-files agent/setup/ 2>/dev/null || true
```

This keeps everything version-controlled with the project:
- **agent/setup/SETUP.md** - Original setup instructions
- **agent/setup/PROJECT-BRIEF.md** - Requirements and decisions
- **agent/setup/TECHNICAL-DECISIONS.md** - Technology choices
- **agent/setup/commands/** - Workflow guides
- **agent/setup/knowledge/** - Platform guidance
- **agent/setup/provided-files/** - Original user files

Benefits:
- Future sessions can reference requirements without external files
- Parent directory stays clean for new projects
- Original intent is documented alongside implementation

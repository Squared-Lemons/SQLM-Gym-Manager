---
name: start-session
description: Begin session with branch awareness and context loading
allowed-tools: Read, Bash
---

# Start Session - Branch-Aware Entry Point

Begin a new coding session with branch safety check, git status, and context loading.

---

## Step 1: Check Current Branch

```bash
git branch --show-current
```

---

## Step 2: Branch Safety Check

Compare the branch name against protected branches: `main`, `master`, `develop`, `release/*`

### If on a PROTECTED branch

Display warning prominently:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  PROTECTED BRANCH WARNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're on [branch] — a protected branch.
Direct changes here are not allowed to keep the codebase safe.

To start safe work:
→ /new-feature "short-description"    (creates branch or worktree)
→ Or: git checkout -b feature/your-name

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Then continue to show git status and session context below.

### If on a feature branch

Display confirmation:

```
✓ On branch: [branch] — safe to make changes
```

---

## Step 3: Git Status

```bash
git status --short --branch
```

Show:
- Modified/staged files
- Ahead/behind remote (if tracking)

---

## Step 4: Load Tool Intelligence (silently)

```bash
ls .project/tool-intelligence.md 2>/dev/null || echo "NO_INTELLIGENCE"
```

If file exists, read `.project/tool-intelligence.md` silently. Use this knowledge to:
- Proactively select tools throughout the session
- Skip exploration for known patterns
- Minimize tokens by avoiding redundant tool discovery

---

## Step 5: Load Session Note

```bash
ls .project/session-note.md 2>/dev/null || echo "NO_NOTE"
```

### If session note exists

Read `.project/session-note.md` and display:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Note from Last Session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Contents of session-note.md]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### If no session note exists

Display the Getting Started guide:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GYM MANAGEMENT SYSTEM - Getting Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monorepo with two apps sharing API + database.

## Quick Commands

  /new-feature     → Create feature branch (safe to make changes)
  /commit          → Draft commit message and commit
  /complete-feature→ Merge or create PR when done
  /summary         → Generate accomplishments report
  /end-session     → Wrap up session, update docs, commit

## Project Structure

  apps/owner/      → Owner web app (manage gyms, members, classes)
  apps/member/     → Member web app (book classes, QR check-in)
  packages/ui/     → Shared UI components (shadcn)
  packages/database/ → Drizzle schema and migrations
  packages/auth/   → Better Auth configuration
  packages/api/    → Shared API utilities

## Dev Commands

  pnpm dev              → Start all apps
  pnpm dev --filter owner → Start owner app only
  pnpm db:studio        → Open Drizzle Studio

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Execution Instructions

1. Get current branch name
2. Check if on protected branch → show warning if yes
3. Show git status (modified files, ahead/behind)
4. Load tool intelligence silently if exists
5. Show session note or Getting Started guide
6. Keep output concise and actionable

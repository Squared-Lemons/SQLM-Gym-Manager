# New-Feature Command - Implementation Guide

A Claude Code command for creating feature branches or worktrees for safe, isolated development.

---

## Overview

The `/new-feature` command creates a safe workspace for development by branching off the current branch. It handles branch naming, uncommitted changes, and offers worktree mode for parallel work.

### What It Does

| Step | Action |
|------|--------|
| 1 | Validates argument (feature description) |
| 2 | Generates slugified branch name |
| 3 | Checks for uncommitted changes |
| 4 | Asks: regular branch or worktree? |
| 5 | Creates branch/worktree |
| 6 | Confirms setup |

---

## Files to Create

### Main Command: `.claude/commands/new-feature.md`

```markdown
---
name: new-feature
description: Create feature branch (or worktree) for safe development
allowed-tools: Bash, AskUserQuestion
---

# New Feature - Safe Branch Creation

Create a feature branch or worktree for safe development work.

**Arguments**: `$ARGUMENTS` - Short description of the feature (e.g., "payment-redesign")

---

## Step 1: Validate Arguments

If `$ARGUMENTS` is empty or missing, ask the user:

\```
What feature are you working on? Please provide a short description.
Example: "add user authentication" or "fix checkout bug"
\```

---

## Step 2: Generate Branch Name

Convert `$ARGUMENTS` to a valid branch name:
- Lowercase
- Replace spaces with hyphens
- Remove special characters
- Prefix with `feature/`

Example: "Add User Authentication" → `feature/add-user-authentication`

---

## Step 3: Check Current State

\```bash
git branch --show-current
git status --porcelain
\```

If there are uncommitted changes, warn the user:

\```
⚠️  You have uncommitted changes. Options:
1. Stash them (git stash) and continue
2. Commit them first
3. Bring them to the new branch (they'll come with you)

How would you like to proceed?
\```

---

## Step 4: Ask Branch Mode

Present options to the user:

\```
How would you like to set up the feature branch?

1. **Regular branch** (recommended for most work)
   Creates: feature/[name] branching from current HEAD

2. **Worktree** (for parallel development)
   Creates: ../worktrees/[name] with its own working directory
   Useful when you need to keep current work intact
\```

---

## Step 5: Create Branch or Worktree

### For Regular Branch

\```bash
git checkout -b feature/[slugified-name]
\```

### For Worktree

\```bash
mkdir -p ../worktrees
git worktree add ../worktrees/[slugified-name] -b feature/[slugified-name]
\```

Then inform the user:

\```
Worktree created at ../worktrees/[name]

To work there:
→ Open a new terminal and cd into ../worktrees/[name]
→ Or run: cd ../worktrees/[name] && claude

Your current directory stays on the original branch.
\```

---

## Step 6: Confirm Setup

Display confirmation:

\```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Feature Branch Ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch: feature/[name]
Status: Safe to make changes

When you're done:
→ /complete-feature    (push + create PR)
→ /end-session         (docs + commit + wrap up)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\```

---

## Execution Instructions

1. Parse `$ARGUMENTS` for feature description
2. Generate slugified branch name
3. Check for uncommitted changes, handle appropriately
4. Ask user: regular branch or worktree?
5. Create branch/worktree based on choice
6. Confirm setup and remind about `/complete-feature`
```

---

## Branch Name Slugification

### Rules

1. Convert to lowercase
2. Replace spaces with hyphens
3. Remove special characters (keep alphanumeric and hyphens)
4. Collapse multiple hyphens into one
5. Trim leading/trailing hyphens
6. Prefix with `feature/`

### Examples

| Input | Output |
|-------|--------|
| "Add User Authentication" | `feature/add-user-authentication` |
| "Fix bug #123" | `feature/fix-bug-123` |
| "Update API (v2)" | `feature/update-api-v2` |
| "URGENT: Payment Fix!" | `feature/urgent-payment-fix` |

### Implementation

```bash
# Bash slugification
echo "$ARGUMENTS" | tr '[:upper:]' '[:lower:]' | \
  sed 's/[^a-z0-9 -]//g' | \
  tr ' ' '-' | \
  sed 's/--*/-/g' | \
  sed 's/^-//;s/-$//'
```

---

## Handling Uncommitted Changes

### Detection

```bash
git status --porcelain
```

If output is non-empty, there are uncommitted changes.

### Options

| Option | Command | When to Use |
|--------|---------|-------------|
| Stash | `git stash` | Save for later, start clean |
| Commit | `git add -A && git commit` | Changes are complete |
| Bring along | Just checkout | Continue on new branch |

### Bringing Changes

When user chooses to bring changes along, simply checkout:

```bash
git checkout -b feature/[name]
```

The uncommitted changes remain in the working tree on the new branch.

---

## Regular Branch vs Worktree

### Regular Branch

**Best for:** Most development work

```bash
git checkout -b feature/[name]
```

- Changes current working directory to new branch
- Existing uncommitted changes come along
- Simple, familiar git workflow

### Worktree

**Best for:** Parallel development, quick fixes while mid-feature

```bash
mkdir -p ../worktrees
git worktree add ../worktrees/[name] -b feature/[name]
```

- Creates separate directory with its own working tree
- Current directory stays on original branch
- Can work on both simultaneously
- Requires opening new terminal/editor for the worktree

### Worktree Management

List worktrees:
```bash
git worktree list
```

Remove worktree (after merging):
```bash
git worktree remove ../worktrees/[name]
```

---

## Output Examples

### Successful Branch Creation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Feature Branch Ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch: feature/add-user-authentication
Status: Safe to make changes

When you're done:
→ /complete-feature    (push + create PR)
→ /end-session         (docs + commit + wrap up)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Worktree Creation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Worktree Created
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Location: ../worktrees/add-user-authentication
Branch: feature/add-user-authentication

To work there:
→ Open a new terminal: cd ../worktrees/add-user-authentication
→ Or run: cd ../worktrees/add-user-authentication && claude

Your current directory stays on: main

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### With Uncommitted Changes

```
⚠️  You have uncommitted changes:

 M apps/web/app/page.tsx
 M packages/ui/src/button.tsx
?? apps/web/app/new-file.ts

Options:
1. Stash them (save for later, start clean)
2. Commit them first
3. Bring them to the new branch (they'll come with you)

How would you like to proceed?
```

---

## Customization Points

### Branch Prefix

Default: `feature/`

Alternatives:
- `[username]/` - Personal prefix
- `feat/` - Shorter prefix
- `[type]/` - feat/, fix/, docs/, etc.

### Worktree Location

Default: `../worktrees/`

Alternatives:
- `../trees/` - Shorter
- `.worktrees/` - Inside repo (add to .gitignore)

### Branch Naming Convention

Can include additional context:
- Date: `feature/2026-01-add-auth`
- Ticket: `feature/PROJ-123-add-auth`
- User: `feature/jonogill/add-auth`

---

## Integration with Workflow

### After `/new-feature`

User works normally on the feature branch:
- Makes changes
- Commits frequently
- Tests functionality

### When Done

Two paths:

1. **`/complete-feature`** - Push and create PR or merge
2. **`/end-session`** - Update docs, commit, leave session note

### The Teaching Effect

By requiring a feature branch before making changes, users develop the habit of:
- Never committing directly to main
- Isolating work in feature branches
- Keeping main clean and deployable

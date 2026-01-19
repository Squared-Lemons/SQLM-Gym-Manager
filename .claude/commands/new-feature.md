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

```
What feature are you working on? Please provide a short description.
Example: "add user authentication" or "fix checkout bug"
```

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

```bash
git branch --show-current
git status --porcelain
```

If there are uncommitted changes, warn the user:

```
⚠️  You have uncommitted changes. Options:
1. Stash them (git stash) and continue
2. Commit them first
3. Bring them to the new branch (they'll come with you)

How would you like to proceed?
```

---

## Step 4: Ask Branch Mode

Present options to the user:

```
How would you like to set up the feature branch?

1. **Regular branch** (recommended for most work)
   Creates: feature/[name] branching from current HEAD

2. **Worktree** (for parallel development)
   Creates: ../worktrees/[name] with its own working directory
   Useful when you need to keep current work intact
```

---

## Step 5: Create Branch or Worktree

### For Regular Branch

```bash
git checkout -b feature/[slugified-name]
```

### For Worktree

```bash
mkdir -p ../worktrees
git worktree add ../worktrees/[slugified-name] -b feature/[slugified-name]
```

Then inform the user:

```
Worktree created at ../worktrees/[name]

To work there:
→ Open a new terminal and cd into ../worktrees/[name]
→ Or run: cd ../worktrees/[name] && claude

Your current directory stays on the original branch.
```

---

## Step 6: Confirm Setup

Display confirmation:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Feature Branch Ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch: feature/[name]
Status: Safe to make changes

When you're done:
→ /complete-feature    (push + create PR)
→ /end-session         (docs + commit + wrap up)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Execution Instructions

1. Parse `$ARGUMENTS` for feature description
2. Generate slugified branch name
3. Check for uncommitted changes, handle appropriately
4. Ask user: regular branch or worktree?
5. Create branch/worktree based on choice
6. Confirm setup and remind about `/complete-feature`

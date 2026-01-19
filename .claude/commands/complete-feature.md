---
name: complete-feature
description: Wrap up feature branch - merge or create PR
allowed-tools: Bash, AskUserQuestion
---

# Complete Feature - Branch Wrap-up

Wrap up a feature branch: review changes, then either merge directly or create a pull request.

---

## Step 1: Verify Branch State

```bash
git branch --show-current
```

If on `main`, `master`, `develop`, or `release/*`:

```
⚠️  You're on [branch] — this command is for feature branches.

If you have uncommitted work, use:
→ /new-feature "description"   to create a safe branch first
```

Stop execution.

---

## Step 2: Check for Uncommitted Changes

```bash
git status --porcelain
```

If there are uncommitted changes:

```
You have uncommitted changes:
[list files]

Would you like to:
1. Commit them now (I'll help draft a message)
2. Stash them for later
3. Continue without committing (changes won't be included)
```

Handle based on user choice.

---

## Step 3: Show Changes Summary

Get the merge base and show diff:

```bash
git merge-base HEAD main || git merge-base HEAD master
```

```bash
git log --oneline [merge-base]..HEAD
```

```bash
git diff --stat [merge-base]..HEAD
```

Display:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Feature Summary: [branch-name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commits ([count]):
[commit log]

Files changed:
[diff stat]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 4: Commit Review (if many commits)

If there are more than 5 commits, suggest:

```
You have [count] commits. Consider:
1. Keep as-is (all commits preserved)
2. Squash into fewer commits

Most teams prefer clean history. Would you like to squash?
```

If user wants to squash, guide them through interactive rebase or suggest:

```
To squash interactively:
git rebase -i [merge-base]

Or I can help you squash everything into one commit with a summary message.
```

---

## Step 4.5: Template Sync Check

Check if templates are out of sync with your changes:

```bash
ls .project/sync-report.md 2>/dev/null || echo "NO_SYNC_REPORT"
```

### If sync report exists

Display:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  Templates Out of Sync
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your command templates may be out of sync with active commands.
Consider syncing before completing this feature.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Ask using AskUserQuestion:
- **Sync now** - Run /sync-templates before completing
- **Skip** - Continue without syncing

If user chooses to sync, invoke `/sync-templates` and wait for completion.

### If no sync report

Continue to Step 5.

---

## Step 5: Choose Completion Method

Ask the user:

```
How would you like to complete this feature?

1. **Merge to main** (solo workflow)
   Merges branch directly into main/master and pushes

2. **Create Pull Request** (team workflow)
   Pushes branch and opens PR for review
```

---

## Step 6A: Direct Merge (if option 1)

### Fetch and check for conflicts

```bash
git fetch origin main || git fetch origin master
git merge-base --is-ancestor origin/main HEAD || git merge-base --is-ancestor origin/master HEAD
```

If main has moved ahead, warn:

```
⚠️  Main branch has new commits. Options:
1. Rebase your changes on top (recommended)
2. Merge main into your branch first
3. Proceed anyway (may cause conflicts)
```

### Perform the merge

```bash
git checkout main || git checkout master
git merge --no-ff [feature-branch] -m "Merge [feature-branch]: [summary]"
git push origin main || git push origin master
```

### Cleanup

```bash
git branch -d [feature-branch]
git push origin --delete [feature-branch]  # Optional: delete remote branch
```

Display:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Feature Merged
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch [feature-branch] merged into main and pushed.
Local branch deleted.

You're now on main with your changes live.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Want to update docs or wrap up the session?
→ /end-session
```

For worktrees, also show:

```
To remove the worktree:
  git worktree remove ../worktrees/[name]
```

---

## Step 6B: Create Pull Request (if option 2)

### Push to remote

```bash
git push -u origin HEAD
```

If push fails (no remote, auth issues), help troubleshoot.

### Check if gh CLI is available

```bash
which gh
```

### If gh is available

Draft PR details:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Pull Request Draft
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Title: [Generated from branch name or commits]

Body:
## Summary
[Generated from commit messages]

## Changes
[List of key changes]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create this PR? (You can edit the title/body first)
```

If approved, create PR:

```bash
gh pr create --title "[title]" --body "[body]"
```

Display the PR URL.

### If gh is not available

```
GitHub CLI (gh) not found. To create PR:
1. Install gh: https://cli.github.com/
2. Or visit: https://github.com/[owner]/[repo]/compare/[branch]
```

### Show cleanup instructions

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Pull Request Created
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PR: [URL]

When PR is merged, clean up:

For regular branches:
  git checkout main && git pull
  git branch -d [branch-name]

For worktrees:
  git worktree remove ../worktrees/[name]
  git branch -d [branch-name]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Want to update docs or wrap up the session?
→ /end-session
```

---

## Execution Instructions

1. Verify on feature branch (not protected)
2. Check for uncommitted changes, handle them
3. Show diff from merge-base to HEAD
4. Offer to squash if many commits
5. Check for template sync report - offer to sync if exists
6. Ask: merge directly or create PR?
7. If merge: checkout main, merge, push, cleanup branch
8. If PR: push branch, create PR via `gh`, show cleanup instructions
9. Suggest `/end-session` for docs updates

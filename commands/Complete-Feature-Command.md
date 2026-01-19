# Complete-Feature Command - Implementation Guide

A Claude Code command for wrapping up feature branches by merging to main or creating a pull request.

---

## Overview

The `/complete-feature` command handles the completion of a feature branch. It reviews changes, suggests commit cleanup, and offers two paths: direct merge (solo workflow) or pull request (team workflow).

### What It Does

| Step | Action |
|------|--------|
| 1 | Verifies on a feature branch |
| 2 | Reviews all changes (commits, diff) |
| 3 | Suggests squashing if many commits |
| 4 | Asks: merge directly or create PR? |
| 5 | Executes chosen workflow |
| 6 | Offers cleanup (delete branch/worktree) |

---

## Files to Create

### Main Command: `.claude/commands/complete-feature.md`

```markdown
---
name: complete-feature
description: Wrap up feature branch - merge or create PR
allowed-tools: Bash, AskUserQuestion
---

# Complete Feature - Branch Wrap-up

Wrap up a feature branch: review changes, then either merge directly or create a pull request.

---

## Step 1: Verify Branch State

\```bash
git branch --show-current
\```

If on `main`, `master`, `develop`, or `release/*`:

\```
⚠️  You're on [branch] — this command is for feature branches.

If you have uncommitted work, use:
→ /new-feature "description"   to create a safe branch first
\```

Stop execution.

---

## Step 2: Check for Uncommitted Changes

\```bash
git status --porcelain
\```

If there are uncommitted changes:

\```
You have uncommitted changes:
[list files]

Would you like to:
1. Commit them now (I'll help draft a message)
2. Stash them for later
3. Continue without committing (changes won't be included)
\```

Handle based on user choice.

---

## Step 3: Show Changes Summary

Get the merge base and show diff:

\```bash
git merge-base HEAD main || git merge-base HEAD master
\```

\```bash
git log --oneline [merge-base]..HEAD
\```

\```bash
git diff --stat [merge-base]..HEAD
\```

Display:

\```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Feature Summary: [branch-name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commits ([count]):
[commit log]

Files changed:
[diff stat]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\```

---

## Step 4: Commit Review (if many commits)

If there are more than 5 commits, suggest:

\```
You have [count] commits. Consider:
1. Keep as-is (all commits preserved)
2. Squash into fewer commits

Most teams prefer clean history. Would you like to squash?
\```

If user wants to squash, guide them through interactive rebase or suggest:

\```
To squash interactively:
git rebase -i [merge-base]

Or I can help you squash everything into one commit with a summary message.
\```

---

## Step 4.5: Template Sync Check

Check if templates are out of sync with your changes:

\```bash
ls .project/sync-report.md 2>/dev/null || echo "NO_SYNC_REPORT"
\```

### If sync report exists

Display:

\```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  Templates Out of Sync
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your command templates may be out of sync with active commands.
Consider syncing before completing this feature.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\```

Ask using AskUserQuestion:
- **Sync now** - Run /sync-templates before completing
- **Skip** - Continue without syncing

If user chooses to sync, invoke `/sync-templates` and wait for completion.

### If no sync report

Continue to Step 5.

---

## Step 5: Choose Completion Method

Ask the user:

\```
How would you like to complete this feature?

1. **Merge to main** (solo workflow)
   Merges branch directly into main/master and pushes

2. **Create Pull Request** (team workflow)
   Pushes branch and opens PR for review
\```

---

## Step 6A: Direct Merge (if option 1)

### Fetch and check for conflicts

\```bash
git fetch origin main || git fetch origin master
git merge-base --is-ancestor origin/main HEAD || git merge-base --is-ancestor origin/master HEAD
\```

If main has moved ahead, warn:

\```
⚠️  Main branch has new commits. Options:
1. Rebase your changes on top (recommended)
2. Merge main into your branch first
3. Proceed anyway (may cause conflicts)
\```

### Perform the merge

\```bash
git checkout main || git checkout master
git merge --no-ff [feature-branch] -m "Merge [feature-branch]: [summary]"
git push origin main || git push origin master
\```

### Cleanup

\```bash
git branch -d [feature-branch]
git push origin --delete [feature-branch]  # Optional: delete remote branch
\```

Display:

\```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Feature Merged
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch [feature-branch] merged into main and pushed.
Local branch deleted.

You're now on main with your changes live.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Want to update docs or wrap up the session?
→ /end-session
\```

For worktrees, also show:

\```
To remove the worktree:
  git worktree remove ../worktrees/[name]
\```

---

## Step 6B: Create Pull Request (if option 2)

### Push to remote

\```bash
git push -u origin HEAD
\```

If push fails (no remote, auth issues), help troubleshoot.

### Check if gh CLI is available

\```bash
which gh
\```

### If gh is available

Draft PR details:

\```
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
\```

If approved, create PR:

\```bash
gh pr create --title "[title]" --body "[body]"
\```

Display the PR URL.

### If gh is not available

\```
GitHub CLI (gh) not found. To create PR:
1. Install gh: https://cli.github.com/
2. Or visit: https://github.com/[owner]/[repo]/compare/[branch]
\```

### Show cleanup instructions

\```
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
\```

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
```

---

## Branch Verification

### Protected Branch Detection

```bash
BRANCH=$(git branch --show-current)

case "$BRANCH" in
  main|master|develop)
    echo "Protected branch"
    exit 1
    ;;
  release/*)
    echo "Protected branch"
    exit 1
    ;;
  *)
    echo "Feature branch - OK"
    ;;
esac
```

### Feature Branch Patterns

Recognized feature branch patterns:
- `feature/*`
- `feat/*`
- `fix/*`
- `bugfix/*`
- `hotfix/*`
- `[username]/*`
- Any branch not in protected list

---

## Squashing Commits

### When to Suggest

Suggest squashing when:
- More than 5 commits on the branch
- Many "WIP" or "fix" commits
- History would be cleaner consolidated

### Squash Process

```bash
# Get the merge base (where branch diverged)
BASE=$(git merge-base HEAD main)

# Soft reset to base (keeps all changes staged)
git reset --soft $BASE

# Create single commit with all changes
git commit -m "Add user authentication

- Implement login/logout endpoints
- Add JWT token generation
- Create session middleware
- Add tests for auth flow"
```

### Commit Message for Squash

Generate a good commit message by:
1. Reading all commit messages
2. Summarizing the feature
3. Listing key changes as bullet points

---

## Merge vs Pull Request

### When to Use Merge

- Solo projects
- Small teams with trust
- Quick fixes
- No code review required

### When to Use PR

- Team collaboration
- Code review required
- CI/CD checks needed
- Documentation of changes

### PR Body Template

```markdown
## Summary
[1-3 bullet points describing the feature]

## Changes
- [List of significant changes]

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] No regressions found

## Screenshots (if applicable)
[Add screenshots for UI changes]
```

---

## Output Examples

### Feature Branch Review

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature Branch Review: feature/add-user-authentication
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commits: 3
a1b2c3d Add login endpoint
d4e5f6g Add JWT token generation
h7i8j9k Add session middleware

Files changed: 8
 apps/web/app/api/auth/login/route.ts   | 45 ++++++
 apps/web/app/api/auth/logout/route.ts  | 23 +++
 packages/auth/src/jwt.ts               | 67 +++++++++
 packages/auth/src/middleware.ts        | 34 +++++
 ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### After Merge

```
✓ Merged feature/add-user-authentication to main
✓ Deleted feature branch

To push: git push origin main
```

### After PR Creation

```
✓ Pushed feature/add-user-authentication to origin
✓ Created PR: https://github.com/user/repo/pull/42

Next steps:
- Review the PR at the link above
- Request reviewers if needed
- Merge when approved
```

---

## Error Handling

### Uncommitted Changes

```
⚠️  You have uncommitted changes.

Please commit or stash them before completing the feature:
- /commit to commit changes
- git stash to stash for later
```

### Merge Conflicts

```
⚠️  Merge conflict detected.

Files with conflicts:
- apps/web/app/page.tsx
- packages/ui/src/button.tsx

Options:
1. Resolve conflicts manually, then run /complete-feature again
2. Abort merge: git merge --abort
```

### GitHub CLI Not Installed

```
⚠️  GitHub CLI (gh) not found.

To create PRs automatically:
1. Install: brew install gh
2. Authenticate: gh auth login

Or create the PR manually:
- Push: git push -u origin feature/[name]
- Open: https://github.com/[user]/[repo]/compare/feature/[name]
```

---

## Customization Points

### Default Merge Target

Default: `main`

Customize for projects using different trunk branches:
- `master` - Legacy projects
- `develop` - GitFlow projects
- `trunk` - Some CI/CD setups

### PR Template

Customize the PR body template for your project's needs:
- Add checklist items
- Include issue references
- Add deployment notes

### Squash Threshold

Default: 5 commits

Adjust based on team preference:
- Lower (3) for very clean history
- Higher (10) for detailed commit history
- Never for projects that want all commits

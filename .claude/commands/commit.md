---
description: Draft a commit message, get approval, then commit changes
---

# Commit - Draft and Commit Changes

---

## Step 1: Gather Information

Run these commands in parallel:

```bash
git status
```

```bash
git diff
```

```bash
git diff --staged
```

```bash
git log --oneline -5
```

If there are no changes (nothing staged or unstaged), inform the user:
```
No changes to commit.
```

---

## Step 2: Draft Commit Message

Analyze all changes (staged + unstaged) and draft a commit message:

1. **First line**: Concise summary (50 chars or less ideally)
   - Use imperative mood ("Add feature" not "Added feature")
   - Capitalize first letter
   - No period at end

2. **Body** (if needed): Explain the "why" not the "what"

3. **Match the repo's style** based on recent commits

---

## Step 3: Show Message and Get Approval

**IMPORTANT:** Show the commit message FIRST as a code block, THEN ask for approval.

### 3a. Display the commit message clearly

```
Commit message:
───────────────────────────────────────────────────────────────

[full commit message here, including body and co-author line]

───────────────────────────────────────────────────────────────

Files to commit:
- [file1] - [brief description]
- [file2] - [brief description]
```

### 3b. Ask for approval

AFTER showing the message, use AskUserQuestion with options:
- **Commit** - Stage all and commit with this message
- **Edit message** - Change the commit message
- **Cancel** - Don't commit

If user chooses to edit, ask what changes they want, revise, and show the new message again before asking.

---

## Step 4: Commit

Once approved:

1. Stage all changes:
```bash
git add -A
```

2. Commit with the approved message:
```bash
git commit -m "$(cat <<'EOF'
[approved commit message]

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

3. Verify:
```bash
git log --oneline -1
```

---

## Step 5: Report Success

```
Committed: [hash] [message]

To push: git push
```

---

## Notes

- Never commit files that look like secrets (.env, credentials, API keys)
- If pre-commit hooks fail, show the error and offer to fix
- Never use --no-verify unless explicitly requested

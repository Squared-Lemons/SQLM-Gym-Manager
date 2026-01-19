---
name: end-session
description: End coding session - update docs, capture learnings, commit changes
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task
---

# Session End - Knowledge Capture

Wrap up this coding session by updating documentation and capturing lessons learned.

---

## What This Command Does

1. **Reviews session changes** - Analyzes git diff and commits from this session
2. **Updates README.md** - Keeps user-facing documentation accurate (commands, workflows, setup)
3. **Updates CLAUDE.md** - Syncs implementation status, recent changes, known issues
4. **Checks template sync** - Offers to sync if templates are out of date
5. **Updates agents/knowledge** - Reflects any workflow changes or new patterns
6. **Captures lessons** - Documents what worked, what didn't, and insights gained
7. **Saves session log** - Archives summary to `.project/sessions/YYYY-MM-DD.md` (local, not in git)
8. **Extracts token usage** - Parses Claude Code session for cost tracking and estimation
9. **Generates SETUP.md** - Auto-creates/updates handoff document with env vars, OAuth setup, feature status
10. **Generates creator feedback** - Auto-generates feedback from session for user to copy to master agent
11. **Shows summary** - Lists all changes ready to commit
12. **Commits with approval** - User signs off on commit message (does NOT push)
13. **Session note** - Optional note to yourself for next session (shown by /start-session)

---

## Step 1: Gather Session Context

First, understand what happened this session:

```bash
# Recent commits (likely this session)
git log --oneline -10

# All uncommitted changes
git status

# Full diff of recent work
git diff HEAD~5..HEAD --stat
```

Read these to understand the session's scope.

---

## Step 2: Update README.md

The README is user-facing documentation. Keep it accurate:

### Check for outdated information
- Do commands listed still exist and work as described?
- Does the architecture diagram reflect current reality?
- Are setup instructions still correct?
- Do workflows match implementation?

### Update sections as needed
- **Commands tables** - Add new commands, remove deprecated ones
- **Getting Started** - Update if setup process changed
- **How It Works** - Update if architecture or workflow changed

### Tone consistency
- Keep it user-friendly and accessible
- Don't add technical implementation details (those go in CLAUDE.md)
- Focus on what users need to know, not how it works internally

---

## Step 3: Update CLAUDE.md

Review and update each section:

### Implementation Status Table
- Check each component - has its status changed?
- Did we add new components?
- Did we fix known issues?

### Recent Changes
- Add entries for significant changes made this session
- Format: `- **YYYY-MM-DD:** Description of change`
- Keep most recent at top

### Known Issues
- Remove any issues that were fixed
- Add any new issues discovered
- Be specific about reproduction steps

---

## Step 3.5: Check Template Sync

Check if templates are out of sync with active commands.

```bash
ls .project/sync-report.md 2>/dev/null || echo "NO_SYNC_REPORT"
```

### If sync report exists

Read `.project/sync-report.md` and display summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  Template Sync Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[N] templates are out of sync with your active commands.

Changes in your commands won't propagate to spawned projects
until templates are updated.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Ask using AskUserQuestion:
- **Sync now** - Run /sync-templates interactively
- **Skip** - Continue without syncing (can sync later)

If user chooses to sync, invoke `/sync-templates` and wait for completion.

After handling (sync or skip), delete the report:

```bash
rm -f .project/sync-report.md
```

### If no sync report

Continue to Step 4.

---

## Step 4: Update Workflow Documentation

If workflows changed, update:

### Agents
Check if any agent definitions need updating:
- `.claude/agents/*.md` - agent capabilities and instructions

### Knowledge
Check if any knowledge were added or modified:
- `.claude/knowledge/*/SKILL.md` - skill definitions

### Commands
Check if any commands were added or modified:
- `.claude/commands/*.md` - command definitions

---

## Step 5: Capture Lessons Learned

Create or update `LEARNINGS.md` in the project root with insights from this session.

### Categories to capture:

**What Worked Well**
- Patterns that proved effective
- Tools/approaches that saved time
- Successful debugging strategies

**What Didn't Work**
- Approaches that failed or were abandoned
- Time sinks to avoid
- Antipatterns discovered

**Technical Insights**
- Library quirks or gotchas
- Performance observations
- Compatibility issues

**Process Improvements**
- Workflow optimizations
- Documentation gaps filled
- New commands or automations added

---

## Step 6: Sync Supporting Files

### Check for orphaned documentation
- Are there docs referencing removed features?
- Are there new features without documentation?

### Verify consistency
- Do agent descriptions match their implementations?
- Do skill descriptions match their capabilities?
- Does CLAUDE.md reflect current reality?

---

## Step 7: Save Session Log

Save the summary to a local (gitignored) session log file organised by date.

### File location
`.project/sessions/YYYY-MM-DD.md`

If the file already exists (multiple sessions same day), append to it with a timestamp separator.

### Format
```markdown
# Session Log: YYYY-MM-DD

## Session at HH:MM

### Changes Made
- [List from summary]

### Documentation Updated
- [List from summary]

### Key Insights
- [Lessons captured]

---
```

### Create the file
```bash
# Ensure directory exists
mkdir -p .project/sessions
```

Then write/append the session summary to `.project/sessions/YYYY-MM-DD.md`.

This creates a local archive of all session work that won't clutter the git repo.

---

## Step 7b: Extract Token Usage

Extract token usage from the current Claude Code session for cost tracking.

### Find the session JSONL file

Claude Code stores session data in `~/.claude/projects/<project-path>/<session-id>.jsonl`

```bash
# Get project path (replace / with -)
PROJECT_PATH=$(pwd | sed 's|^/||' | sed 's|/|-|g')
SESSION_DIR=~/.claude/projects/$PROJECT_PATH

# Get most recent session file (likely current session)
LATEST_SESSION=$(ls -t "$SESSION_DIR"/*.jsonl 2>/dev/null | head -1)
echo "Session file: $LATEST_SESSION"
```

### Parse token usage

Extract token metrics from assistant messages:

```bash
cat "$LATEST_SESSION" | jq -s '
  [.[] | select(.type == "assistant") | .message.usage // empty] |
  {
    input_tokens: (map(.input_tokens // 0) | add),
    output_tokens: (map(.output_tokens // 0) | add),
    cache_read_input_tokens: (map(.cache_read_input_tokens // 0) | add),
    cache_creation_input_tokens: (map(.cache_creation_input_tokens // 0) | add),
    turns: length
  }
'
```

### Determine billing type

- **subscription**: Interactive Claude Code sessions (default for manual work)
- **api**: Background agents, automated tasks, programmatic API calls

For normal sessions, use `subscription`. When running as a background agent or via API, use `api`.

### Add Token Usage section to session log

Include this section in the session log (raw tokens only, no cost):

```markdown
### Token Usage
| Metric | Value |
|--------|-------|
| Billing type | subscription |
| Input tokens | [input_tokens] |
| Output tokens | [output_tokens] |
| Cache read | [cache_read_input_tokens] |
| Cache creation | [cache_creation_input_tokens] |
| Turns | [turns] |
```

### Update cumulative token stats

Also update `.project/token-usage.md` with raw token data (costs calculated at report time):

```markdown
# Token Usage History

Raw token data. Costs are calculated at report time using current pricing.

## Subscription Limits

Configure your subscription tier limits here for usage tracking:

| Limit | Value | Notes |
|-------|-------|-------|
| Daily limit | [tokens] | Your plan's daily token limit |
| Hourly limit | [tokens] | Your plan's hourly token limit |

## Session Log
| Date | Type | Input | Output | Cache Read | Cache Create | Turns |
|------|------|-------|--------|------------|--------------|-------|
| YYYY-MM-DD HH:MM | subscription | [n] | [n] | [n] | [n] | [n] |
| YYYY-MM-DD HH:MM | api | [n] | [n] | [n] | [n] | [n] |
```

If the file doesn't exist, create it with the first session's data and prompt user to configure their subscription limits.

**Important**: Store raw tokens only. `/summary` calculates costs and limit usage at report time.

---

## Step 7c: Update Tool Intelligence

Update `.project/tool-intelligence.md` to track tools used and patterns learned.

### If the file doesn't exist, create it

```bash
mkdir -p .project
```

Then create `.project/tool-intelligence.md` with the template structure (see the file for format).

### Review the session for tool usage

**Toolhive MCP** - Check if any `mcp__toolhive-mcp-optimizer__call_tool` calls were made:
- github (search_code, list_issues, create_pull_request, etc.)
- perplexity-ask (perplexity_ask, perplexity_research, perplexity_reason)
- FireCrawl (firecrawl_scrape, firecrawl_crawl, firecrawl_search)
- ShadCN (get_component, get_block, list_components)
- DataForSeo, n8n, HF-Data, PodMule-MCP

**Plugins** - Check if plugin knowledge were invoked:
- /feature-dev, /frontend-design, /ralph-loop

**Browser Automation** - Check for claude-in-chrome usage:
- read_page, computer, navigate, form_input, find

**Core Tool Patterns** - Note any efficient patterns discovered:
- Task(Explore) instead of direct Glob/Grep
- Specific Grep output_mode that worked well
- Parallel tool calls that saved time

### Update the file

1. **Add new shortcuts** if task → tool patterns emerged
2. **Update usage stats** by category
3. **Append to session log** with date and tools used

### Questions to guide updates

- Did a Toolhive tool solve something faster than manual browsing? → Add shortcut
- Did we discover a better tool for a common task? → Update existing shortcut
- Did we use a tool in a new way? → Document the pattern

---

## Step 8: Generate/Update SETUP.md

Create or update a `SETUP.md` file that serves as the handoff document for this project.

### Check if SETUP.md exists

If it doesn't exist, create it. If it does, update it with current information.

### Required sections

```markdown
# Project Setup

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | How to Get |
|----------|-------------|------------|
| [var] | [description] | [instructions] |

## OAuth Setup (if applicable)

### [Provider] OAuth
1. [Step-by-step instructions]
2. Add authorized redirect URI: `{APP_URL}/api/auth/callback/[provider]`
3. Copy credentials to `.env`

## Installation

\```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
\```

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| [Feature] | ✅ Working | - |
| [Feature] | 🚧 In Progress | [Notes] |
| [Feature] | ⏳ Planned | [Notes] |

## Known Issues

- [Any known issues or limitations]
```

### Gather information automatically

1. **Environment variables**: Read `.env.example` or `.env` to list required variables
2. **OAuth providers**: Check auth config for configured social providers
3. **Feature status**: Review recent commits and implementation status
4. **Known issues**: Pull from CLAUDE.md known issues section

### Update strategy

- If SETUP.md already exists, update only sections that changed
- Keep user-edited content intact (add warnings for auto-generated sections)
- Feature status should reflect actual implementation state

---

## Step 9: Creator Feedback

Automatically generate useful feedback for the master agent based on this session's work.

### Analyze the session for feedback

Review the session and identify:

**Knowledge Gaps**
- What information was missing from knowledge docs that you had to figure out?
- What errors or outdated info did you encounter?
- What patterns did you implement that should be documented?

**Setup Issues**
- What configuration was missing or unclear?
- What gotchas did you hit during development?
- What should be pre-configured in future setups?

**New Patterns**
- What reusable code patterns were created?
- What commands or workflows should be standardized?
- What UI components or utilities could be shared?

**Technical Gotchas**
- What library issues were discovered?
- What config settings were required but not documented?
- What error messages led to non-obvious solutions?

### Generate and display feedback

Create structured feedback and display it for easy copy-paste:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATOR FEEDBACK - Copy to Squared-Agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Feedback from [Project Name] - YYYY-MM-DD

### Knowledge Gaps
- [Specific missing info that would have helped]
- [Patterns worth adding to knowledge docs]

### Setup Issues
- [Config that should be pre-configured]
- [Gotchas to document for future projects]

### New Patterns
- [Reusable patterns created this session]
- [Code worth extracting to templates]

### Technical Gotchas
- [Library issues and solutions]
- [Config requirements discovered]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To send this feedback to the master agent:
1. Save as: inbox/from-projects/YYYY-MM-DD-[project-name].md
2. Copy to the Squared-Agent repository
```

### Save feedback locally

Also save to `docs/creator-feedback.md` for local reference.

**Important:** Only include feedback if there's something meaningful to report. If the session was routine with no issues or discoveries, skip this step.

---

## Step 10: Summary Output

Show the user what was done and what will be committed:

```
## Session Summary

### Changes Made
- [List of significant changes]

### Documentation Updated
- [List of files updated]

### Lessons Captured
- [Key insights from this session]

### Ready to Commit
- [List of files that will be committed]

### Suggested Follow-ups
- [Any tasks for next session]
```

---

## Step 11: Commit with Approval

This is the final step. The user signs off on the commit message.

### Check for uncommitted changes
```bash
git status
git diff --stat
```

### If no changes exist
Inform the user: "All changes already committed. Nothing to do."

### If changes exist

1. **Draft a commit message** summarizing the session's work
2. **Show the message clearly** as a code block BEFORE asking:

```
Commit message:
───────────────────────────────────────────────────────────────

[full commit message here]

───────────────────────────────────────────────────────────────
```

3. **Ask for approval** using AskUserQuestion:
   - **Commit** - Stage all and commit with this message
   - **Edit message** - Change the commit message
   - **Skip** - Don't commit (user will handle manually)

### Commit message format
```
Session-end: [brief summary of session work]

[Detailed bullet points of what was done]

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Once approved

1. Stage all changes:
```bash
git add -A
```

2. Commit:
```bash
git commit -m "$(cat <<'EOF'
[approved commit message]

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

3. Confirm:
```
Committed: [hash] [first line of message]

To push: git push
```

**Important:** Do NOT push. The user will push when ready.

---

## Step 12: Session Note for Next Time

Ask the user if they want to leave a note for their next session.

### Ask using AskUserQuestion

- **Leave a note** - Write a note for next session
- **Skip** - No note needed

### If user wants to leave a note

1. Ask: "What would you like to remember for next session?"
2. Save their response to `.project/session-note.md`:

```bash
mkdir -p .project
```

Then write the note to `.project/session-note.md` (overwrites any existing note).

### If user skips

That's fine - the previous note (if any) will remain.

---

## Execution Instructions

1. **Read recent git history** to understand session scope
2. **Read README.md** and check if user-facing docs need updates
3. **Make updates** to README.md if commands, workflows, or setup changed
4. **Read CLAUDE.md** and identify needed updates
5. **Make updates** to CLAUDE.md (implementation status, recent changes, known issues)
6. **Check template sync** - if `.project/sync-report.md` exists, offer to run /sync-templates
7. **Check agents/knowledge** for any that need updates based on session work
8. **Create/update LEARNINGS.md** with session insights
9. **Save session log** to `.project/sessions/YYYY-MM-DD.md` (local archive)
10. **Extract token usage** from Claude Code session JSONL, add to session log and `.project/token-usage.md`
11. **Update tool intelligence** in `.project/tool-intelligence.md` with tools used and patterns learned
12. **Generate/update SETUP.md** with env vars, OAuth setup, feature status, known issues
13. **Generate creator feedback** - analyze session for gaps/issues/patterns, display for user to copy
14. **Output summary** of what was done and what will be committed
15. **Get user approval** and commit (do NOT push)
16. **Ask about session note** - offer to save a note for next session (shown by /start-session)

Be thorough but concise. Focus on changes that will help future sessions understand the current state of the project.

**The commit is the final sign-off.** Everything is updated and ready before the user approves. The session note is optional but helps /catch-up provide context next time.

---

## Starting Now

Begin the session-end process by gathering context about what was done this session.

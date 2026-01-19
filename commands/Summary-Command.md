# Summary Command - Implementation Guide

A Claude Code command for generating structured accomplishment summaries from git history and session logs.

---

## Overview

The `/summary` command generates a report of work done over a specified time period by analyzing git commits and session logs.

### What It Does

| Step | Action |
|------|--------|
| 1 | Asks user for time period (Today, Yesterday, Past 7 days, Custom) |
| 2 | Gathers git commits and stats for the period |
| 3 | Checks for session logs in the date range |
| 3b | Aggregates token usage data if available |
| 4 | Categorizes commits by type (features, fixes, refactors, etc.) |
| 5 | Generates a structured summary report with cost data |

### Use Cases

- Personal review of work done
- Sharing progress with team members
- Converting to email updates
- Tracking productivity over time

---

## Files to Create

### 1. Main Command: `.claude/commands/summary.md`

```markdown
---
description: Generate an accomplishments summary for a specified time period
---

# Summary - Accomplishments Report

Generate a structured report of git activity and session work for a time period.

---

## Step 1: Ask Time Period

Use AskUserQuestion to ask which time period to summarize:

- **Today** - All commits since midnight today
- **Yesterday** - Commits from yesterday only
- **Past 7 days** - Last week of activity
- **Custom** - Specify number of days

If user selects "Custom", follow up asking for the number of days.

---

## Step 2: Gather Git Data

Based on the selected time period, run these commands in parallel:

### Date calculations:
- **Today**: `--since="00:00:00"`
- **Yesterday**: `--since="yesterday 00:00:00" --until="today 00:00:00"`
- **Past N days**: `--since="N days ago"`

### Commands to run:

\```bash
# Commits with details
git log --since="[date]" --format="%H|%s|%ai" --no-merges
\```

\```bash
# Commit stats (files changed)
git log --since="[date]" --stat --no-merges
\```

---

## Step 3: Check Session Logs

Check for session logs in the date range:

\```bash
ls -la .project/sessions/ 2>/dev/null || echo "No session logs directory"
\```

If session logs exist for dates in the range, read them:
- Location: `.project/sessions/YYYY-MM-DD.md`

---

## Step 3b: Aggregate Token Usage

If `.project/token-usage.md` exists, aggregate token data for the time period.

### Read cumulative token file

\```bash
cat .project/token-usage.md 2>/dev/null || echo "No token usage data"
\```

### Filter session log entries by date

Parse the Session Log table in `.project/token-usage.md` to filter sessions in the date range.

### Calculate period totals by billing type

Sum up separately for `subscription` and `api`:
- Input tokens
- Output tokens
- Cache read tokens
- Cache creation tokens

### Calculate costs at report time

Apply current pricing based on billing type:

**Subscription pricing** (Claude Code subscription - included in plan):
- Subscription sessions are covered by the monthly fee
- Track usage against daily/hourly limits from `.project/token-usage.md`
- Calculate % of limits used to assess subscription tier needs
- Display token totals for optimization insights

**API pricing** (per million tokens, Claude Opus 4.5):
- Input: $15
- Output: $75
- Cache read: $1.50
- Cache creation: $18.75

Formula for API cost:
\```
api_cost = (input × 15 + output × 75 + cache_read × 1.5 + cache_creation × 18.75) / 1,000,000
\```

**Note**: Pricing may change. Update these values when Anthropic updates pricing.

---

## Step 4: Categorize Commits

Sort commits into categories based on their messages:

| Category | Patterns |
|----------|----------|
| Features | `feat:`, `feature:`, "add", "implement", "create" |
| Fixes | `fix:`, "bug", "resolve", "correct" |
| Refactors | `refactor:`, "simplify", "clean", "restructure" |
| Docs | `docs:`, "documentation", "readme" |
| Chores | `chore:`, "update", "upgrade", "bump" |
| Style | `style:`, "format", "lint" |

---

## Step 5: Generate Report

Output the report in this format:

\```
# Accomplishments Summary

**Period:** [Start Date] to [End Date]
**Total Commits:** [count]

---

## Features Added
[List features grouped by area if related]

## Bug Fixes
[List fixes with brief descriptions]

## Refactoring & Improvements
[List refactors]

## Documentation Updates
[List doc changes]

## Other Changes
[Anything that doesn't fit above categories]

---

## Session Highlights

### Key Changes
[From session logs if available - summarize major work]

### Insights Captured
[Key learnings from session logs]

---

## Token Usage

### Subscription Sessions (Claude Code)
| Date | Sessions | Input | Output | Cache Read | Cache Create |
|------|----------|-------|--------|------------|--------------|
| [date] | [n] | [n]K | [n]K | [n]K | [n]K |
| **Total** | **[n]** | **[n]K** | **[n]K** | **[n]K** | **[n]K** |

#### Limit Analysis (if limits configured)
| Metric | Usage | Limit | % Used |
|--------|-------|-------|--------|
| Peak daily usage | [n]K | [limit]K | [%]% |
| Peak hourly usage | [n]K | [limit]K | [%]% |
| Days hitting daily limit | [n] / [total days] | - | - |
| Hours hitting hourly limit | [n] / [total hours] | - | - |

**Subscription assessment:**
- [If frequently hitting limits: "Consider upgrading subscription tier"]
- [If rarely hitting limits: "Current tier appears sufficient"]
- [If no limits configured: "Configure limits in .project/token-usage.md for usage tracking"]

### API Sessions (Background Agents)
| Date | Sessions | Input | Output | Cache Read | Cache Create | Est. Cost |
|------|----------|-------|--------|------------|--------------|-----------|
| [date] | [n] | [n]K | [n]K | [n]K | [n]K | $[cost] |
| **Total** | **[n]** | **[n]K** | **[n]K** | **[n]K** | **[n]K** | **$[total]** |

### Insights
- Subscription sessions: [n] (covered by plan)
- API sessions: [n] (estimated cost: $[total])
- Cache efficiency: [%] (cache reads / total input)
- Heaviest API session: [date] ($[cost])

(Only include sections with data. Skip API section if no API sessions.)

---

## Statistics

| Category | Count |
|----------|-------|
| Features | [n] |
| Fixes | [n] |
| Refactors | [n] |
| Docs | [n] |
| Chores | [n] |
| Files changed | [n] |
\```

---

## Edge Cases

- **No commits found**: Display "No activity found for the selected time period"
- **No session logs**: Skip the Session Highlights section entirely
- **No token usage data**: Skip the Cost Summary section entirely
- **Multiple sessions same day**: Combine highlights and token data from all sessions
- **Empty categories**: Omit sections with no items

---

## Output Notes

The report should be:
1. **Copy-paste friendly** - Can be shared directly
2. **Scannable** - Use bullet points, not paragraphs
3. **Factual** - Don't embellish or add commentary

If user asks to adjust for email, convert to prose format suitable for email updates.

---

## Starting Now

Ask the user which time period they want to summarize.
```

---

## Setup Requirements

### 1. Session Logs Directory (Optional)

For richer summaries, enable session logging:

```bash
mkdir -p .project/sessions
```

Add to `.gitignore`:
```
.project/sessions/
```

Session logs are created by `/end-session` and follow the format:
```
.project/sessions/YYYY-MM-DD.md
```

### 2. Consistent Commit Messages

The categorization works best with conventional commits or descriptive messages:

| Pattern | Category |
|---------|----------|
| `feat: Add user auth` | Features |
| `fix: Resolve login bug` | Fixes |
| `refactor: Simplify auth flow` | Refactors |
| `docs: Update README` | Docs |
| `chore: Bump dependencies` | Chores |

---

## Commit Categorization Rules

### Features
- Prefix: `feat:`, `feature:`
- Keywords: "add", "implement", "create", "introduce", "new"

### Fixes
- Prefix: `fix:`
- Keywords: "bug", "resolve", "correct", "repair", "patch"

### Refactors
- Prefix: `refactor:`
- Keywords: "simplify", "clean", "restructure", "reorganize"

### Documentation
- Prefix: `docs:`
- Keywords: "documentation", "readme", "comment", "jsdoc"

### Chores
- Prefix: `chore:`
- Keywords: "update", "upgrade", "bump", "dependency"

### Style
- Prefix: `style:`
- Keywords: "format", "lint", "prettier", "eslint"

---

## Report Format Details

### Header Section

```
# Accomplishments Summary

**Period:** January 10, 2026 to January 13, 2026
**Total Commits:** 15
```

### Category Sections

Each category lists commits as bullet points:

```
## Features Added
- Add user authentication with JWT tokens
- Implement dashboard analytics view
- Create export functionality for reports
```

Empty categories should be omitted entirely.

### Session Highlights

Only include if session logs exist:

```
## Session Highlights

### Key Changes
- Major refactoring of auth system
- New caching layer added

### Insights Captured
- JWT refresh tokens require careful expiry handling
- Database pooling improved response times by 40%
```

### Statistics Table

```
## Statistics

| Category | Count |
|----------|-------|
| Features | 5 |
| Fixes | 3 |
| Refactors | 2 |
| Docs | 2 |
| Chores | 3 |
| Files changed | 47 |
```

---

## Date Calculation Reference

| Period | Git Flag |
|--------|----------|
| Today | `--since="00:00:00"` |
| Yesterday | `--since="yesterday 00:00:00" --until="today 00:00:00"` |
| Past 7 days | `--since="7 days ago"` |
| Past N days | `--since="N days ago"` |

---

## Customization Points

| Element | Default | Customization |
|---------|---------|---------------|
| Session log path | `.project/sessions/` | Change to match your project |
| Commit patterns | Conventional commits | Add project-specific patterns |
| Report sections | All included | Remove sections not needed |
| Statistics | Category counts | Add lines of code, etc. |

---

## Usage

```bash
/summary
```

The command will:
1. Ask which time period to summarize
2. Gather git commits and session logs
3. Categorize and compile the report
4. Output a copy-paste ready summary

### Follow-up Options

After generating, users can ask:
- "Adjust for email" - Convert to prose format
- "More detail on features" - Expand a section
- "Export to file" - Save to a markdown file

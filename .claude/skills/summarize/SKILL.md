---
name: summarize
description: Summarize what changed in the working tree and recent commits, list all uncompleted TODOs and open change requests, and report without making any changes. Use when the user says "/summarize", "summarize what changed", "what's changed", "what's left to do", or similar.
---

## When to invoke

Use this skill when the user wants a read-only status snapshot of the project. Common triggers:

- `/summarize`
- "summarize what changed"
- "what's changed"
- "what's left to do"
- "give me a summary"
- "what's been done"
- "what's still open"

**This skill makes zero changes to any file.**

## Workflow

### Step 1 — Git status and recent changes

Run these in parallel:

```bash
git status --short
git diff HEAD
git log --oneline -10
```

From the output, identify:
- Which files are modified, added, deleted, or untracked.
- What the changes actually do (read the diff, not just the filenames).
- The last 10 commits — note the theme of recent work.

### Step 2 — Scan for TODOs and incomplete markers

Grep the source files for common incomplete-work markers:

```
TODO, FIXME, HACK, XXX, TEMP, WIP, NOCOMMIT, BUG
```

Collect every hit: file path, line number, and the full line text.

### Step 3 — Scan for open change requests

Check if a `change-requests/` directory exists. If it does, read every `.md` file in it and look for unchecked acceptance criteria (lines matching `- [ ]`). List each open item with its CR number and title.

### Step 4 — Report

Print the report in this exact structure. Omit any section that has nothing to show (e.g., skip "Open Change Requests" if the directory doesn't exist or all CRs are complete).

```
## Project Summary

### What Changed
**Uncommitted changes** (or "Working tree is clean"):
- `path/to/file.js` — short description of what changed and why

**Recent commits:**
- `abc1234` feat: description
- `def5678` fix: description
(up to 10)

---

### Uncompleted TODOs
- `path/to/file.js:42` — TODO: message here
- `path/to/file.js:87` — FIXME: message here

(or "None found." if the grep returns nothing)

---

### Open Change Requests
- **CR-001** Title of the CR
  - [ ] Acceptance criterion still open
  - [ ] Another open criterion

(or "None found." if no change-requests/ dir or all criteria are checked)
```

## Guardrails

- **Read only.** Do not edit, create, or delete any file.
- **Do not fix** anything you find — report it and stop.
- **Do not guess** at what changes mean — describe only what the diff and commit messages say.

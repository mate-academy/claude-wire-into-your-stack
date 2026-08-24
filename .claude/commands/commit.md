---
description: Run pre-PR checks, then stage and commit with a proper message
argument-hint: [desired direction/focus for the commit message]
---

Optional direction for the commit message from the user: $ARGUMENTS

If given, use it to steer the message's focus and wording (still keep it concise and in the style of recent commits) rather than overriding it wholesale — reconcile it with what the diff actually shows. If it contradicts the actual diff, point that out instead of writing a misleading message.

Before committing, verify the change is safe to ship:

1. Run `npm run lint` and `npm test`. If either fails, stop and report the failure — do not commit broken code.
2. Review the diff (`git status`, `git diff`) against this repo's conventions from CLAUDE.md:
   - one route file per resource, mounted in `server.js`
   - all data access goes through `db/store.js` (routes never hold state directly)
   - input validated in the route: `400` on bad input, `404` when a record is missing
   - error responses are JSON shaped `{ "error": "message" }`
   Flag anything that violates these conventions instead of committing it silently.
3. Stage the relevant files (avoid `git add -A`/`git add .` — add files by name) and check `git status` after staging for anything unexpected (secrets, unrelated files).
4. Write a concise commit message focused on *why*, matching the style of recent commits (`git log`).
5. Create the commit. Do not push unless explicitly asked.

If lint/tests fail or a convention is violated, report it and ask how to proceed instead of committing anyway.

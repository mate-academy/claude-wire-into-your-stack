---
description: Scaffold one new API resource the way this project already writes routes, store helpers, and tests.
argument-hint: [resource]
---

Add a new resource named $ARGUMENTS to this Express API.

If `$ARGUMENTS` is still that token, take the rest of the line after this command as the resource name.

If the name is missing, stop and ask.

Follow `.claude/skills/resource-route/SKILL.md` and the conventions in CLAUDE.md.

Read `docs/api.md` first so the new resource matches the documented request and error shape.

Add only what that resource needs: store helpers, `routes/<name>.js`, a mount in `server.js`, tests, and a short section in `docs/api.md`.

Then stop.

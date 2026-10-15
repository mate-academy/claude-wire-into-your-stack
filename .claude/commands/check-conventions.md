---
description: Review code against this repo's CLAUDE.md conventions
---

Review $ARGUMENTS (or the current uncommitted diff if no argument is given) against
this repo's conventions from CLAUDE.md:
- One route file per resource, mounted in server.js under its base path
- All data access goes through db/store.js — routes never hold state directly
- Input validated in the route: 400 on bad input, 404 when a record is missing
- Error responses are JSON shaped { "error": "message" }

Report any violations found, file and line, with a one-line fix suggestion each.
If everything complies, say so briefly — don't invent nitpicks.

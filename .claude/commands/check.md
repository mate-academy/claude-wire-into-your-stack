---
description: Run lint and tests, the same checks CI runs on every push/PR
---

Run `npm run lint` and then `npm test`, in that order (matching
`.github/workflows/ci.yml`). Report both results clearly:

- If either fails, show the relevant error output and stop — do not attempt
  to fix anything unless asked.
- If both pass, confirm briefly and stop.

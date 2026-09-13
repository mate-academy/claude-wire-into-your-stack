---
description: Review uncommitted route changes against main for documentation and test coverage
---

Compare the current branch against `main`.

Make sure every changed route:
- has a description in `docs/api.md`;
- has its logic and edge cases covered by tests in the corresponding test file.

Display the review in the following format:

## [route file name]

### [METHOD] [URL]

- Covered: 🟢 YES / 🔴 NO
- Documented: 🟢 YES / 🔴 NO

---
name: verify
description: Run linting and tests to verify code quality before committing
---

# Verify Code Quality

Runs both linting and tests to ensure code quality and functionality.

## Commands

```bash
npm run lint
npm run test
```

## Purpose

Before committing or pushing changes, verify that:
- Code passes ESLint rules (code style)
- All tests pass (functionality)

This prevents committing broken or poorly-styled code.

## Output

Reports results from both `npm run lint` and `npm run test`:
- ✅ If both pass: code is ready to commit
- ❌ If either fails: fix the issues before committing

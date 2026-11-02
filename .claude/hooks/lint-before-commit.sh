#!/usr/bin/env bash
# PreToolUse hook: before any `git commit` run by Claude, run the project's
# lint. If lint fails, exit 2 so the commit is blocked and the lint output is
# sent back to Claude.

input=$(cat)

# Only act on Bash calls that contain a git commit command.
if ! printf '%s' "$input" | grep -qE 'git[[:space:]]+commit'; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

if ! output=$(npm run --silent lint 2>&1); then
  {
    echo "Commit blocked: lint failed. Fix these errors, then commit again."
    echo "$output"
  } >&2
  exit 2
fi

exit 0

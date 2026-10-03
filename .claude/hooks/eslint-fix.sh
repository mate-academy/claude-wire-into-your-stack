#!/usr/bin/env bash
# PostToolUse hook: after Claude edits a .js file, auto-fix it with ESLint and
# report anything left over back to Claude (exit 2), so the lint standard CI
# enforces holds on every edit, not just at push time.
file=$(jq -r '.tool_input.file_path // empty')
case "$file" in
  *.js) ;;
  *) exit 0 ;;
esac
case "$file" in
  */node_modules/*) exit 0 ;;
esac
cd "$CLAUDE_PROJECT_DIR" || exit 0
# Fresh checkout without `npm install`: skip rather than block every edit.
if [ ! -x node_modules/.bin/eslint ]; then
  echo "eslint-fix hook skipped: run npm install to enable it." >&2
  exit 0
fi
if ! output=$(npx --no-install eslint --fix "$file" 2>&1); then
  echo "ESLint found problems in $file that --fix could not resolve:" >&2
  echo "$output" >&2
  exit 2
fi
exit 0

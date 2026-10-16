#!/usr/bin/env bash
# PostToolUse hook: after Claude edits a JS file, auto-fix it with ESLint.
# Anything ESLint can't fix is sent back to Claude (exit 2) so it gets corrected.
file=$(jq -r '.tool_input.file_path // empty')
case "$file" in
  *.js) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
if ! out=$(npx --no-install eslint --fix "$file" 2>&1); then
  echo "ESLint errors in $file:" >&2
  echo "$out" >&2
  exit 2
fi

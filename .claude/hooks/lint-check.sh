#!/usr/bin/env bash
# PostToolUse hook: lint any .js file Claude just edited/wrote, and if it
# violates the project's ESLint rules, feed the violations back so Claude
# fixes them immediately instead of waiting for CI.
input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path // empty')

[ -z "$file" ] && exit 0
[[ "$file" != *.js ]] && exit 0
[ -f "$file" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
output=$(npx eslint "$file" 2>&1)

if [ -n "$output" ]; then
  echo "$output" >&2
  exit 2
fi

exit 0

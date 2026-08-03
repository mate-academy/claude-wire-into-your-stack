#!/bin/bash
# PostToolUse hook: auto-lint-fix whatever file Edit/Write just touched.
set -euo pipefail

file=$(jq -r '.tool_input.file_path // empty')

[[ "$file" == *.js ]] || exit 0
[[ -f "$file" ]] || exit 0

eslint_bin="$CLAUDE_PROJECT_DIR/node_modules/.bin/eslint"
[[ -x "$eslint_bin" ]] || exit 0

"$eslint_bin" --fix "$file" || true
exit 0

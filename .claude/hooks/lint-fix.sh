#!/bin/bash
# PostToolUse hook: auto-fix lint issues on any .js file Claude just edited or wrote.
set -euo pipefail

FILE=$(jq -r '.tool_input.file_path // empty')
[ -z "$FILE" ] && exit 0

case "$FILE" in
  *.js) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}"
[ -f "$FILE" ] || exit 0

npx eslint --fix "$FILE" || true
exit 0

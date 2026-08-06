#!/usr/bin/env bash
# Auto-formats JavaScript files after Edit/Write tools using ESLint --fix.
# Fires on PostToolUse for Edit and Write matchers.

# Extract the file path from the hook's JSON input on stdin.
# Uses node (guaranteed available in this project) instead of jq.
FILE_PATH=$(node -p "JSON.parse(require('fs').readFileSync(0, 'utf-8')).tool_input?.file_path || ''" 2>/dev/null)

# Only process .js files; skip config, docs, node_modules, etc.
case "$FILE_PATH" in
  ''|*node_modules*|*.json|*.md|*.gitignore|*.lock) exit 0 ;;
  *.js) ;;
  *) exit 0 ;;
esac

# Run ESLint --fix from the project root so it finds the config.
# Use the local eslint binary if installed; fall back gracefully otherwise
# so that a missing dependency never blocks the user's edit.
cd "$CLAUDE_PROJECT_DIR" || exit 0
if [ -x "./node_modules/.bin/eslint" ]; then
  ./node_modules/.bin/eslint --fix "$FILE_PATH" || true
else
  npx --no-install eslint --fix "$FILE_PATH" 2>/dev/null || true
fi

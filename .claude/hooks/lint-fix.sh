#!/usr/bin/env bash
# PostToolUse hook: auto-fixes lint issues on the file Claude just
# edited/created, scoped to the same tree `npm run lint` covers
# (server.js, routes/, db/, tests/). Non-blocking — reacts, doesn't gate.
set -euo pipefail

file="$(node -e "
  let d = '';
  process.stdin.on('data', c => d += c);
  process.stdin.on('end', () => {
    try {
      const j = JSON.parse(d);
      process.stdout.write((j.tool_input && j.tool_input.file_path) || '');
    } catch (e) {}
  });
")"

case "$file" in
  "$CLAUDE_PROJECT_DIR"/server.js|"$CLAUDE_PROJECT_DIR"/routes/*.js|"$CLAUDE_PROJECT_DIR"/db/*.js|"$CLAUDE_PROJECT_DIR"/tests/*.js)
    cd "$CLAUDE_PROJECT_DIR" && npx eslint --fix "$file"
    ;;
  *)
    exit 0
    ;;
esac

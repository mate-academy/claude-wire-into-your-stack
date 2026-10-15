#!/usr/bin/env bash
# PreToolUse hook: block destructive git/shell commands (force-push, hard
# reset, rm -rf) before they run, so an unattended session can't wipe work.
set -euo pipefail

input="$(cat)"
command="$(node -e "
  const d = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  process.stdout.write((d.tool_input && d.tool_input.command) || '');
" <<< "$input")"

if echo "$command" | grep -Eq '(git\s+push\s+(--force|-f\b|.*--force))|(git\s+reset\s+--hard)|(rm\s+-rf\s)'; then
  echo "Blocked: '$command' looks destructive (force-push, hard reset, or rm -rf). Run it manually if it's really needed." >&2
  exit 2
fi

exit 0

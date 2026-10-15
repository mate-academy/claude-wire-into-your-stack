#!/usr/bin/env bash
# PreToolUse guard: block force-pushes so shared course branches stay recoverable.
set -euo pipefail

input="$(cat)"
command="$(printf '%s' "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input", {}).get("command", ""))' 2>/dev/null || true)"

if printf '%s' "$command" | grep -Eq '(^|[[:space:]])git[[:space:]]+push([^[:alnum:]]|--).*(-f|--force|--force-with-lease)'; then
  reason='Force-push blocked by project hook. Use a normal push, or ask a human to force-push deliberately.'
  printf '%s\n' "$reason" >&2
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "$reason"
  }
}
EOF
  exit 0
fi

exit 0

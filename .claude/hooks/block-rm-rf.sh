#!/usr/bin/env bash
# PreToolUse guard: blocks recursive force deletes
# (rm -rf, rm -fr, rm -r -f).

cmd=$(jq -r '.tool_input.command // empty')

pattern='rm[[:space:]]+('
pattern+='-[a-zA-Z]*[rR][a-zA-Z]*f'
pattern+='|-[a-zA-Z]*f[a-zA-Z]*[rR]'
pattern+='|-[rR][[:space:]]+-f'
pattern+='|-f[[:space:]]+-[rR])'

if echo "$cmd" | grep -Eq "$pattern"; then
  echo "Blocked by project hook: 'rm -rf' is not allowed." >&2
  echo "Delete specific files instead." >&2
  exit 2
fi

exit 0

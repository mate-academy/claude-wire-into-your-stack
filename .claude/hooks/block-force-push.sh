#!/usr/bin/env bash
# PreToolUse hook (Bash): block force pushes. Exit 2 = block, stderr goes to Claude.
cmd=$(jq -r '.tool_input.command // empty')

# git push ... with --force, --force-with-lease, or a short-flag cluster containing f (-f, -uf, ...)
if printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+([^;&|]*[[:space:]])?push([[:space:]]+[^;&|]*)?[[:space:]](--force([^[:alnum:]-]|-with-lease|-if-includes|$)|-[a-eg-zA-Z]*f[a-zA-Z]*([[:space:]]|$))'; then
  echo "Blocked: force pushes (--force, -f, --force-with-lease) are not allowed in this project. Use a regular push, or ask the user to run it themselves." >&2
  exit 2
fi
exit 0

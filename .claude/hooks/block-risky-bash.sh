#!/usr/bin/env bash
# PreToolUse hook (matcher: Bash).
#
# Holds one standard for the Course API repo: automated Claude runs must not
# execute history-rewriting or bulk-delete commands against this checkout.
# Reads the tool-call JSON on stdin, inspects the proposed shell command, and
# exits 2 to block it when it matches a risky pattern. Anything else passes
# through untouched (exit 0).

set -euo pipefail

payload="$(cat)"

command="$(printf '%s' "$payload" | jq -r '.tool_input.command // ""')"

# Patterns we never want to run unattended on this repo.
risky=(
  'rm[[:space:]]+-[a-zA-Z]*r[a-zA-Z]*f'   # rm -rf / rm -fr and friends
  'rm[[:space:]]+-[a-zA-Z]*f[a-zA-Z]*r'
  'git[[:space:]]+push[[:space:]].*--force'
  'git[[:space:]]+push[[:space:]].*(^|[[:space:]])-f([[:space:]]|$)'
  'git[[:space:]]+reset[[:space:]]+--hard'
  'git[[:space:]]+clean[[:space:]]+-[a-zA-Z]*f'
)

for pattern in "${risky[@]}"; do
  if printf '%s' "$command" | grep -Eq "$pattern"; then
    echo "Blocked by block-risky-bash hook: command matches /$pattern/." >&2
    echo "Run it by hand if you really mean to." >&2
    exit 2
  fi
done

exit 0

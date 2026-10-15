#!/usr/bin/env bash
# PreToolUse hook: blocks any Bash command containing `rm -rf` (or -fr / --recursive --force).
# Exit 2 blocks the tool call; stderr becomes the reason shown to Claude/the user.
# Uses `node` (not jq) to parse the hook JSON payload, since jq isn't guaranteed to be installed.

cmd=$(node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{process.stdout.write(JSON.parse(d).tool_input.command||'')}catch(e){}})")

if echo "$cmd" | grep -Eqi '\brm\b[^|;&]*(-[a-z]*r[a-z]*f[a-z]*\b|-[a-z]*f[a-z]*r[a-z]*\b|--recursive[^|;&]*--force|--force[^|;&]*--recursive)'; then
  echo "Blocked: 'rm -rf' (recursive force delete) is not allowed by project hook policy." >&2
  exit 2
fi

exit 0

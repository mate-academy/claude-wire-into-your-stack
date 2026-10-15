#!/usr/bin/env bash
# PreToolUse guard for the Bash tool.
# Blocks `git push --force` and `git push -f`; allows `--force-with-lease`.
#
# Input: the PreToolUse JSON payload on stdin (Claude Code's hook format).
# Exit 2 blocks the tool call — stderr becomes the reason shown to the user.
# Exit 0 lets the command proceed unchanged.

set -euo pipefail

command=$(jq -r '.tool_input.command // ""')

# Heuristic text match, not a full shell parser: looks for "git push"
# anywhere in the command, followed by a "--force" or "-f" flag as its
# own word. "--force-with-lease" is explicitly excluded.
if [[ "$command" =~ git[[:space:]]+push ]] \
   && [[ "$command" =~ (^|[[:space:]])(--force|-f)($|[[:space:]]) ]] \
   && [[ "$command" != *"--force-with-lease"* ]]; then
  echo "Blocked: 'git push --force'/'-f' is disabled by project policy (.claude/hooks/block-force-push.sh). Use --force-with-lease, or run the push yourself outside Claude Code." >&2
  exit 2
fi

exit 0

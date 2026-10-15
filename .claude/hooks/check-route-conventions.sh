#!/usr/bin/env bash
#
# PostToolUse hook — keep route files thin.
#
# Project standard (CLAUDE.md + db/store.js): "One route file per resource ...
# All data access goes through db/store.js — routes never hold state directly."
#
# After any Edit/Write/MultiEdit, if the touched file lives in routes/ and either
#   * declares module-level mutable state (a top-level `let` / `var`), or
#   * requires anything other than `express` and `../db/store`
# the hook exits 2 so the change is surfaced back to Claude to fix.

set -uo pipefail

payload="$(cat)"

file="$(printf '%s' "$payload" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))' 2>/dev/null || true)"

case "$file" in
  */routes/*.js|routes/*.js) ;;
  *) exit 0 ;;
esac

[ -f "$file" ] || exit 0

state="$(grep -nE '^[[:space:]]*(let|var)[[:space:]]' "$file" || true)"

imports="$(grep -nE "require\(" "$file" \
  | grep -vE "require\((['\"])express\1\)|require\((['\"])\.\./db/store\2\)" \
  || true)"

if [ -n "$state" ] || [ -n "$imports" ]; then
  {
    echo "Route convention check failed: $file"
    echo "Routes must stay thin — import only 'express' and '../db/store', and keep"
    echo "no module-level mutable state. All data access goes through db/store.js."
    [ -n "$state" ]   && { echo "  module-level mutable state:"; echo "$state" | sed 's/^/    /'; }
    [ -n "$imports" ] && { echo "  disallowed imports:";        echo "$imports" | sed 's/^/    /'; }
  } >&2
  exit 2
fi

exit 0

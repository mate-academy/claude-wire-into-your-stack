#!/usr/bin/env bash
# PreToolUse guard: this project's only "database" is the in-memory store in
# db/store.js (see CLAUDE.md - "All data access goes through db/store.js").
# Blocks two ways of bypassing that:
#   1. Bash commands that write to a DB file/client directly.
#   2. Edits to routes/*.js that introduce their own module-level state or
#      write to disk directly, instead of going through db/store.js.
set -euo pipefail

input=$(cat)
tool_name=$(jq -r '.tool_name // empty' <<<"$input")

deny() {
  jq -n --arg reason "$1" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$reason}}'
  exit 0
}

case "$tool_name" in
  Bash)
    cmd=$(jq -r '.tool_input.command // empty' <<<"$input")
    if grep -qiE '(sqlite3|psql|\bmysql\b|mongosh|\bmongo\b|redis-cli|>>?[[:space:]]*[^[:space:]]*\.(db|sqlite3?)\b|insert[[:space:]]+into|update[[:space:]]+[a-z_]+[[:space:]]+set|delete[[:space:]]+from)' <<<"$cmd"; then
      deny "This command looks like a direct database write (file redirect or DB client), bypassing db/store.js. All data access in this project must go through db/store.js."
    fi
    ;;
  Write|Edit)
    file=$(jq -r '.tool_input.file_path // empty' <<<"$input")
    case "$file" in
      */routes/*.js|routes/*.js)
        text=$(jq -r 'if .tool_name == "Write" then (.tool_input.content // "") else (.tool_input.new_string // "") end' <<<"$input")
        if grep -qE '(let|var)[[:space:]]+[A-Za-z_$][A-Za-z0-9_$]*[[:space:]]*=[[:space:]]*(\[\]|\{\}|new[[:space:]]+Map\(|new[[:space:]]+Set\()|fs\.(writeFileSync|appendFileSync|writeFile|appendFile)\(' <<<"$text"; then
          deny "Route files must not hold their own state or write to disk directly ($file). Read and write through db/store.js instead."
        fi
        ;;
    esac
    ;;
esac

exit 0

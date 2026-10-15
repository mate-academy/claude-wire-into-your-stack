#!/usr/bin/env bash
# PostToolUse hook: auto-fix lint on edited JS files.
# Reads the hook payload from stdin, extracts the edited file path, and runs
# `eslint --fix` on it when it is a .js file. Uses node (always present in this
# project) to parse the JSON so the hook needs no extra dependency like jq.

input=$(cat)
file=$(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write((j.tool_input&&j.tool_input.file_path)||"")}catch{}})')

# Reject empty paths and names that begin with a dash (argv flag smuggling),
# then keep the file inside the project before handing it to eslint.
case "$file" in
  ''|-*) exit 0 ;;
esac

root="${CLAUDE_PROJECT_DIR:-$PWD}"
abs=$(cd "$(dirname "$file")" 2>/dev/null && printf '%s/%s' "$PWD" "$(basename "$file")")
case "$abs" in
  "$root"/*) ;;
  *) exit 0 ;;
esac

case "$abs" in
  *.js)
    npx --no-install eslint --fix -- "$abs" >/dev/null 2>&1 || true
    ;;
esac

exit 0

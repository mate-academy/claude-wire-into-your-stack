#!/usr/bin/env bash
# PostToolUse hook: after Claude edits/writes a JS file, auto-fix and lint it.
# Lint errors that remain are sent back to Claude (exit 2) so it fixes them.
f=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input.file_path||"")}catch(e){}})')
case "$f" in
  *.js) ;;
  *) exit 0 ;;
esac
cd "$CLAUDE_PROJECT_DIR" || exit 0
[ -x node_modules/.bin/eslint ] || exit 0
out=$(node_modules/.bin/eslint --fix "$f" 2>&1) || { echo "ESLint failed on $f:
$out" >&2; exit 2; }
echo "ESLint OK: $f"

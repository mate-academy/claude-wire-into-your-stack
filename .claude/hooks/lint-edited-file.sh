#!/usr/bin/env bash
# PostToolUse hook (Write|Edit): lint the JS file Claude just changed.
# Reads the hook payload from stdin; exit 2 feeds ESLint's output back to Claude
# so it fixes the problem before moving on. Non-JS files are ignored.
file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write((j.tool_input&&j.tool_input.file_path)||"")}catch{}})')
case "$file" in
  *.js) ;;
  *) exit 0 ;;
esac
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
if ! out=$(npx --no-install eslint "$file" 2>&1); then
  echo "ESLint failed on $file:" >&2
  echo "$out" >&2
  exit 2
fi
exit 0

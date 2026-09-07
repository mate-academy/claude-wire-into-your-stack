#!/bin/sh
# PostToolUse hook (matcher: Edit|Write).
# If the edited file is JavaScript, run the project linter with warnings treated
# as failures. A lint problem exits 2 so Claude sees it and fixes it before
# moving on. Non-.js edits are ignored.

file_path=$(node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{try{process.stdout.write(JSON.parse(s).tool_input?.file_path||'')}catch(e){}})")

case "$file_path" in
  *.js) ;;
  *) exit 0 ;;
esac

cd "$CLAUDE_PROJECT_DIR" || exit 0

if ! npm run lint --silent -- --max-warnings=0; then
  echo "eslint reported problems after editing $file_path — fix them before moving on." >&2
  exit 2
fi

#!/bin/sh
# PostToolUse hook (matcher: Edit|Write).
# If the edited file is JavaScript, run the project linter with warnings treated
# as failures. A lint problem exits 2 so Claude sees it and fixes it before
# moving on. Non-.js edits are ignored.

# Pull tool_input.file_path out of the hook's JSON on stdin. node exits 3 if the
# payload isn't the shape we expect, so an unexpected shape is logged, not
# silently swallowed.
file_path=$(node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{try{process.stdout.write(String(JSON.parse(s).tool_input?.file_path||''))}catch(e){process.exit(3)}})")

if [ $? -eq 3 ]; then
  echo "lint-on-js-edit: could not parse tool_input JSON; skipping lint." >&2
  exit 0
fi

case "$file_path" in
  *.js) ;;
  *) exit 0 ;;
esac

# Claude Code sets $CLAUDE_PROJECT_DIR for hooks; fall back to this script's
# location so the hook also works when run by hand.
cd "${CLAUDE_PROJECT_DIR:-$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)}" || exit 0

if ! npm run lint --silent -- --max-warnings=0; then
  echo "eslint reported problems after editing $file_path — fix them before moving on." >&2
  exit 2
fi

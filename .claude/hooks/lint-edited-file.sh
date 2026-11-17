#!/usr/bin/env bash
# PostToolUse hook: after Claude edits or writes a .js file in this project,
# run ESLint on that one file with --fix. If problems remain that --fix can't
# solve, exit 2 so the lint output is fed back to Claude to fix, the same
# standard CI enforces with `npm run lint`.

set -u

# The hook receives the tool call as JSON on stdin; pull out the file path.
# Node is used instead of jq because Node is already required by the project.
file_path=$(node -e '
  let s = "";
  process.stdin.on("data", (d) => (s += d)).on("end", () => {
    try {
      const input = JSON.parse(s);
      process.stdout.write((input.tool_input && input.tool_input.file_path) || "");
    } catch {
      process.stdout.write("");
    }
  });
')

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Only lint JavaScript files inside this project, never dependencies.
case "$file_path" in
  *.js|*.cjs|*.mjs) ;;
  *) exit 0 ;;
esac
case "$file_path" in
  "$project_dir"/node_modules/*|*/node_modules/*) exit 0 ;;
  "$project_dir"/*) ;;
  *) exit 0 ;;
esac
[ -f "$file_path" ] || exit 0

cd "$project_dir" || exit 0

if ! output=$(npx --no-install eslint --fix "$file_path" 2>&1); then
  echo "ESLint found problems in $file_path that --fix could not resolve:" >&2
  echo "$output" >&2
  exit 2
fi

exit 0

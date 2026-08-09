#!/bin/sh
# PostToolUse hook: after Claude edits a .js file, run ESLint --fix on it
# so the project's lint standard holds without anyone remembering to run it.
set -eu

file=$(node -e "
  let input = '';
  process.stdin.on('data', (d) => (input += d));
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      process.stdout.write(data.tool_input && data.tool_input.file_path ? data.tool_input.file_path : '');
    } catch {
      process.stdout.write('');
    }
  });
")

case "$file" in
  *.js)
    if [ -f "$file" ]; then
      npx eslint --fix "$file" || true
    fi
    ;;
esac

exit 0

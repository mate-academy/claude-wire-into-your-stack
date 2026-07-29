#!/bin/sh
# PostToolUse hook: auto-fix lint issues in any .js file just edited/written.
# ESLint 9 needs Node >=18.18 (uses structuredClone); pick up a matching
# version via nvm if the default shell Node is older, best-effort.
file=$(jq -r '.tool_input.file_path // empty')

case "$file" in
  *.js)
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
      . "$HOME/.nvm/nvm.sh"
      nvm use 20 >/dev/null 2>&1 || true
    fi
    output=$(npx eslint --fix "$file" 2>&1)
    status=$?
    if [ $status -ne 0 ]; then
      echo "$output" >&2
      exit 2
    fi
    ;;
esac

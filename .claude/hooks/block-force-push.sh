#!/bin/bash
input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // empty')

if [[ "$command" =~ ^git[[:space:]]+push && "$command" == *"--force"* || "$command" =~ ^git[[:space:]]+push && "$command" == *" -f"* ]]; then
  echo "Blocked: force push is not allowed." >&2
  exit 2
fi

exit 0
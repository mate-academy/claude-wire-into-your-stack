#!/bin/bash
input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // empty')

if [[ "$command" == *"push"* && ("$command" == *"--force"* || "$command" == *" -f"*) ]]; then
  echo "Blocked: force push is not allowed." >&2
  exit 2
fi

exit 0
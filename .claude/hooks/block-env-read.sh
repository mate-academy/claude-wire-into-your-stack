#!/bin/bash
input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

if [[ "$file_path" == *".env"* ]]; then
  echo "Blocked: reading .env files is not allowed." >&2
  exit 2
fi

exit 0
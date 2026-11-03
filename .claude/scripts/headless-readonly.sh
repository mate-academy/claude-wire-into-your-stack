#!/usr/bin/env bash
# Headless demo: read-only tools are pre-approved, edits are not.
# The prompt asks for a change on purpose. With no one to approve it, the
# edit is denied and server.js should stay untouched.
set -euo pipefail
cd "$(dirname "$0")/../.."

claude -p "List the files in routes/ and summarise each endpoint in one line. \
Then add a comment at the top of server.js saying 'reviewed'." \
  --permission-mode default \
  --allowedTools "Read" "Glob" "Grep" "Bash(ls:*)" \
  --output-format text

echo "--- git status (server.js should not appear) ---"
git status --short

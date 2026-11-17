#!/usr/bin/env bash
# Starts the filesystem MCP server with the repo root and project4/ as its allowed directories.
# Paths are computed from this script's location, so it works in any clone.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
dirs=("$root" "$root/project4")

# Under WSL with Windows Node (npx from /mnt/c/...), the server is a Windows process
# and only understands Windows paths, so convert to \\wsl.localhost\... UNC form.
if command -v wslpath >/dev/null && [[ "$(command -v npx)" == /mnt/* ]]; then
  for i in "${!dirs[@]}"; do dirs[$i]="$(wslpath -w "${dirs[$i]}")"; done
fi

exec npx -y @modelcontextprotocol/server-filesystem "${dirs[@]}"

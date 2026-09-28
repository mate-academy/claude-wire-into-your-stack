#!/usr/bin/env bash
# PostToolUse hook (Write): enforces that documentation files are Markdown
# and live under docs/. Root README.md and CLAUDE.md are exempt, matching
# this project's actual layout.
set -euo pipefail

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

[ -z "$file_path" ] && exit 0

basename=$(basename "$file_path")
rel_path=$(realpath --relative-to="$PWD" "$file_path" 2>/dev/null || echo "$file_path")

case "$rel_path" in
  README.md|CLAUDE.md) exit 0 ;;
esac

is_md=false
case "$basename" in
  *.md|*.MD|*.Md) is_md=true ;;
esac

looks_like_doc=false
case "$basename" in
  [Rr][Ee][Aa][Dd][Mm][Ee]*|[Gg][Uu][Ii][Dd][Ee]*|[Dd][Oo][Cc]*|[Cc][Hh][Aa][Nn][Gg][Ee][Ll][Oo][Gg]*|[Cc][Oo][Nn][Tt][Rr][Ii][Bb][Uu][Tt][Ii][Nn][Gg]*)
    looks_like_doc=true ;;
esac

if [ "$is_md" = false ] && [ "$looks_like_doc" = false ]; then
  exit 0
fi

if [ "$is_md" = false ]; then
  echo "{\"decision\":\"block\",\"reason\":\"'$rel_path' looks like documentation but doesn't use a .md extension. Rename it to end in .md and place it under docs/.\"}"
  exit 0
fi

case "$rel_path" in
  docs/*) exit 0 ;;
  *)
    echo "{\"decision\":\"block\",\"reason\":\"'$rel_path' is a Markdown file created outside docs/. This project keeps documentation under docs/ (see CLAUDE.md) — move it there.\"}"
    ;;
esac

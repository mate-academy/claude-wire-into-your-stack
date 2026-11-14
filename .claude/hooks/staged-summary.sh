#!/usr/bin/env bash
# PostToolUse hook: after `git add` or `git status`, show what is staged for the
# next commit and ask Claude to summarise it briefly.

cmd=$(jq -r '.tool_input.command // empty')

# Only react to git add / git status (also inside chains like `git add . && git status`)
echo "$cmd" | grep -Eq '(^|[;&|[:space:]])git[[:space:]]+(add|status)([[:space:]]|$)' || exit 0

stat=$(git diff --cached --stat 2>/dev/null)
[ -z "$stat" ] && exit 0   # nothing staged — stay silent

names=$(git diff --cached --name-status 2>/dev/null)

jq -n --arg stat "$stat" --arg names "$names" '{
  systemMessage: ("Staged for next commit:\n" + $stat),
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: ("Changes staged for the next commit (git diff --cached):\n" + $names + "\n\n" + $stat + "\n\nGive the user a short summary (2-4 bullets) of what this commit will change and why it matters. Read `git diff --cached` if you need detail.")
  }
}'

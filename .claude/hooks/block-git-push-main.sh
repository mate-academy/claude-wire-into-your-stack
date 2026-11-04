#!/bin/bash
# PreToolUse hook (Bash): deny any `git push` that targets main.
# Blocks explicit refs (main, +main, HEAD:main, refs/heads/main) and
# a bare `git push` / `git push <remote>` while the current branch is main.
input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
cwd=$(printf '%s' "$input" | jq -r '.cwd // empty')
[ -n "$cwd" ] && cd "$cwd" 2>/dev/null

deny() {
  jq -n --arg r "$1" '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $r}}'
  exit 0
}

# Split on command separators, check each git push segment.
while IFS= read -r seg || [ -n "$seg" ]; do
  seg=$(printf '%s' "$seg" | sed -E 's/^[[:space:]]+//')
  printf '%s' "$seg" | grep -Eq '^(sudo[[:space:]]+)?git([[:space:]]+-[^[:space:]]+([[:space:]]+[^[:space:]-][^[:space:]]*)?)*[[:space:]]+push([[:space:]]|$)' || continue
  # positional args after "push" (skip flags)
  args=$(printf '%s' "$seg" | sed -E 's/^.*[[:space:]]push([[:space:]]|$)//' | tr ' ' '\n' | grep -v '^-' | grep -v '^$')
  if printf '%s\n' "$args" | grep -Eq '(^|[:+]|refs/heads/)main$'; then
    deny "git push to main is blocked by a user hook. Push a feature branch and open a PR instead."
  fi
  if printf '%s' "$seg" | grep -Eq '(--all|--mirror)'; then
    deny "git push --all/--mirror could update main and is blocked by a user hook."
  fi
  # no refspec given (0 or 1 positional arg = just a remote): pushes the current branch
  n=$(printf '%s\n' "$args" | grep -c .)
  if [ "$n" -le 1 ] && [ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" = "main" ]; then
    deny "Current branch is main, so this git push would push to main. Blocked by a user hook."
  fi
done < <(printf '%s' "$cmd" | perl -pe 's/(&&|\|\||;|\|)/\n/g')
exit 0

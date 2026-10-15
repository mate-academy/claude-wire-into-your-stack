#!/bin/bash
# PreToolUse hook (Bash matcher): deny `git push --force`/`-f`/`--force-with-lease`
# whenever the target is main or master, whether named explicitly or implied
# by the current branch. Rewriting shared history on the trunk branch can
# silently discard teammates' commits and break everyone's local checkout.
jq -r '.tool_input.command' | { read -r c
  echo "$c" | grep -Eq '(^|[;&|]|\s)git\s+push\b' || exit 0
  echo "$c" | grep -Eq '(^|\s)(--force|--force-with-lease(=[^ ]*)?|-f)(\s|$)' || exit 0

  # Walk tokens: find "push" immediately following "git", then collect
  # subsequent non-flag tokens until a shell separator or end of command.
  read -ra tokens <<< "$c"
  positional=()
  in_push=0
  prev=""
  for tok in "${tokens[@]}"; do
    case "$tok" in
      ';'|'&&'|'||'|'|'|'&') in_push=0; prev="$tok"; continue ;;
    esac
    if [ "$in_push" -eq 1 ]; then
      case "$tok" in
        -*) ;;                     # flag, skip
        *) positional+=("$tok") ;; # remote / refspec
      esac
    elif [ "$prev" = "git" ] && [ "$tok" = "push" ]; then
      in_push=1
    fi
    prev="$tok"
  done

  branch=""
  if [ "${#positional[@]}" -ge 2 ]; then
    refspec="${positional[1]}"
    refspec="${refspec#+}"
    if [[ "$refspec" == *:* ]]; then
      branch="${refspec#*:}"
    else
      branch="$refspec"
    fi
  else
    branch=$(git symbolic-ref --short HEAD 2>/dev/null)
  fi
  branch="${branch#refs/heads/}"

  if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
    echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Force push to main/master is blocked by policy. Use a feature branch or coordinate with the team before rewriting shared history."}}'
  fi
}

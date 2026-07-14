#!/bin/sh
# PreToolUse hook: block `git push` targeting main, force pushes hit hardest.

input=$(cat)
command=$(printf '%s' "$input" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')

is_git=0
is_push=0
force=0
after_push=""
seen_push=0

for tok in $command; do
  case "$tok" in
    git) is_git=1 ;;
    push) is_push=1; seen_push=1; continue ;;
  esac
  if [ "$seen_push" = "1" ]; then
    case "$tok" in
      --force|--force-with-lease*|-f)
        force=1
        ;;
      -*)
        ;;
      *)
        after_push="$after_push $tok"
        ;;
    esac
  fi
done

if [ "$is_git" != "1" ] || [ "$is_push" != "1" ]; then
  exit 0
fi

target_main=0
set -- $after_push

case "$#" in
  0|1)
    current=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    [ "$current" = "main" ] && target_main=1
    ;;
  *)
    shift
    for refspec in "$@"; do
      case "$refspec" in
        *:*)
          dst="${refspec#*:}"
          ;;
        HEAD)
          dst=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
          ;;
        *)
          dst="$refspec"
          ;;
      esac
      case "$dst" in
        main|refs/heads/main)
          target_main=1
          ;;
      esac
    done
    ;;
esac

if [ "$target_main" = "1" ]; then
  if [ "$force" = "1" ]; then
    echo "Force push to main blocked. Rewrites shared history, never do direct." >&2
  else
    echo "Push to main blocked. Use PR / feature branch instead." >&2
  fi
  exit 2
fi

exit 0

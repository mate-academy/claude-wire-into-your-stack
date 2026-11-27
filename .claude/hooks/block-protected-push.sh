#!/usr/bin/env bash
# PreToolUse hook (Bash): blocks `git push` to protected branches.
# Exit 2 = block the tool call; the message on stderr is shown to Claude.

PROTECTED_REGEX='^(main|release|maintenance)$'

# Git global options that may appear between `git` and `push`:
#   -c <v>, -C <v>, --git-dir <v>, --work-tree <v>, ... (value after a space)
#   any other -x / --xxx[=v] flag
# Shared by every matcher below so they stay in sync.
GIT_GLOBAL_OPTS='([[:space:]]+(-[Cc]|--(git-dir|work-tree|namespace|config-env|exec-path|super-prefix))[[:space:]]+[^[:space:]]+|[[:space:]]+-[^[:space:]]+)*'
GIT_PUSH_RE="(^|[^[:alnum:]_-])git${GIT_GLOBAL_OPTS}[[:space:]]+push([[:space:]]|\$)"

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
cwd=$(printf '%s' "$input" | jq -r '.cwd // empty')

# Nothing to check if the command has no `git push` in it.
printf '%s' "$cmd" | grep -Eq "$GIT_PUSH_RE" || exit 0

current_branch() {
  git -C "${cwd:-.}" rev-parse --abbrev-ref HEAD 2>/dev/null
}

block() {
  echo "Bloqueado por hook: no se permite hacer push a la rama protegida '$1' (main, release, maintenance). Usa una rama de trabajo y abre un PR." >&2
  exit 2
}

# Split the command into segments (;, &&, ||, |, newlines) and inspect each `git push`.
segments=$(printf '%s' "$cmd" | sed -E 's/(\&\&|\|\||;|\|)/\n/g')

while IFS= read -r seg; do
  # Keep only what comes after `push` in this segment.
  printf '%s' "$seg" | grep -Eq "$GIT_PUSH_RE" || continue
  # Groups: 1 prefix, 2-4 GIT_GLOBAL_OPTS, 5 " args", 6 args.
  rest=$(printf '%s' "$seg" | sed -nE "s/.*(^|[^[:alnum:]_-])git${GIT_GLOBAL_OPTS}[[:space:]]+push([[:space:]]+(.*))?\$/\\6/p")

  positional=()
  for tok in $rest; do
    tok=${tok//\"/}; tok=${tok//\'/}
    case "$tok" in
      --all|--mirror) block "todas las ramas ($tok)" ;;
      -*) ;;                      # other flags (-u, --force, ...)
      *) positional+=("$tok") ;;
    esac
  done

  # positional[0] = remote, the rest = refspecs.
  if [ "${#positional[@]}" -le 1 ]; then
    targets=("$(current_branch)")
  else
    targets=("${positional[@]:1}")
  fi

  for ref in "${targets[@]}"; do
    ref=${ref#+}                  # +main (force)
    ref=${ref##*:}                # src:dst -> dst
    ref=${ref#refs/heads/}
    [ "$ref" = "HEAD" ] || [ -z "$ref" ] && ref=$(current_branch)
    if printf '%s' "$ref" | grep -Eq "$PROTECTED_REGEX"; then
      block "$ref"
    fi
  done
done <<< "$segments"

exit 0

#!/usr/bin/env bash
# PostToolUse hook: keep every edited JS file lint-clean so the `npm run lint`
# gate in CI (.github/workflows/ci.yml) never fails on something a local edit
# introduced. Runs `eslint --fix` on the edited file; if errors remain, reports
# them back (exit 2) so they get fixed before the change moves on.
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$PWD}"

# The edited file's path arrives on stdin as part of the tool-call JSON.
file=$(node -e '
let d = "";
process.stdin.on("data", c => d += c).on("end", () => {
  try {
    const j = JSON.parse(d);
    const p = (j.tool_input && j.tool_input.file_path) ||
              (j.tool_response && j.tool_response.filePath) || "";
    process.stdout.write(p);
  } catch { process.stdout.write(""); }
})')

[ -n "$file" ] || exit 0

# Only the files `npm run lint` covers: server.js plus routes/ db/ tests/.
rel="${file#"$root"/}"
case "$rel" in
  server.js|routes/*.js|db/*.js|tests/*.js) ;;
  *) exit 0 ;;
esac

eslint="$root/node_modules/.bin/eslint"
# A fresh clone before `npm ci` has no eslint yet — skip rather than fail the edit.
[ -x "$eslint" ] || exit 0

if ! out=$(cd "$root" && "$eslint" --fix "$rel" 2>&1); then
  {
    echo "eslint reported problems in $rel — fix these so the CI lint gate stays green:"
    echo "$out"
  } >&2
  exit 2
fi
exit 0

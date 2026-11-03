// PreToolUse guard: blocks any git push that rewrites remote history.
// Claude Code passes the tool call as JSON on stdin; the hook answers with a
// "deny" permission decision, and the reason is shown to Claude.
let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let command = "";
  try {
    command = JSON.parse(input.replace(/^﻿/, "")).tool_input?.command || "";
  } catch {
    // Unparseable input: fall back to scanning the raw payload.
    command = input;
  }
  const isPush = /\bgit\s+push\b/.test(command);
  const isForce = /(\s--force(-with-lease)?\b|\s-f\b|\s\+\S+)/.test(command);
  if (isPush && isForce) {
    // A JSON decision blocks reliably on every platform (exit code 2 is not
    // always propagated by the Windows shell wrapper).
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Blocked by project hook: force-push is not allowed in this repo. Push normally or open a PR.",
      },
    }));
  }
  process.exit(0);
});

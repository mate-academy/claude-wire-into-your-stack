#!/usr/bin/env node
// PreToolUse hook for Bash: blocks any `git push` that targets main.
// Exit 2 (with a message on stderr) blocks the call; exit 0 allows it.

const { execSync } = require("node:child_process");

const PROTECTED = "main";

function isMainRef(ref) {
  // Handles main, +main, refs/heads/main, HEAD:main, feature:refs/heads/main.
  const dest = ref.replace(/^\+/, "").split(":").pop();
  return dest === PROTECTED || dest === `refs/heads/${PROTECTED}`;
}

function currentBranch() {
  try {
    return execSync("git branch --show-current", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function pushesToMain(command) {
  // Check each command in a chain like `a && git push origin main`.
  for (const segment of command.split(/&&|\|\||;|\||\n/)) {
    const tokens = segment
      .trim()
      .split(/\s+/)
      .map((t) => t.replace(/^["']|["']$/g, ""));
    const gitAt = tokens.indexOf("git");
    if (gitAt === -1) continue;
    const pushAt = tokens.indexOf("push", gitAt + 1);
    if (pushAt === -1) continue;

    // Positional args after `push`: first is the remote, the rest are refspecs.
    const args = tokens.slice(pushAt + 1).filter((t) => t && !t.startsWith("-"));
    const refspecs = args.slice(1);
    if (refspecs.some(isMainRef)) return true;

    // No refspec given: git pushes the current branch, so block if it is main.
    if (refspecs.length === 0 && currentBranch() === PROTECTED) return true;
  }
  return false;
}

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let command = "";
  try {
    command = JSON.parse(input).tool_input.command || "";
  } catch {
    process.exit(0); // Not parseable: don't get in the way.
  }

  if (pushesToMain(command)) {
    console.error(`Blocked: pushing to ${PROTECTED} is not allowed. Push a feature branch and open a PR instead.`);
    process.exit(2);
  }
  process.exit(0);
});

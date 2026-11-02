// PreToolUse hook: block any `git push` that targets main (exit code 2 = block).
const { spawnSync } = require("node:child_process");

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  const command = JSON.parse(input).tool_input?.command ?? "";

  // A command can chain several git calls (`a && git push ...`), so check each push separately.
  for (const [, args] of command.matchAll(/\bgit\b[^&;|\n]*?\bpush\b([^&;|\n]*)/g)) {
    const tokens = args.trim().split(/\s+/).filter(Boolean);
    const positional = tokens.filter((t) => !t.startsWith("-"));

    // Explicit target: `origin main`, `HEAD:main`, `+main`, `refs/heads/main`.
    const namesMain = positional.slice(1).some((t) => /(^|[:/+])main$/.test(t));
    // No refspec (`git push` / `git push origin`) pushes the current branch.
    const usesCurrentBranch = positional.length <= 1 && onMain();

    if (namesMain || usesCurrentBranch) {
      console.error("Blocked: pushing to main is not allowed. Push a branch and open a PR instead.");
      process.exit(2);
    }
  }
});

function onMain() {
  const result = spawnSync("git", ["branch", "--show-current"], {
    cwd: process.env.CLAUDE_PROJECT_DIR,
    encoding: "utf8",
  });
  return result.stdout.trim() === "main";
}

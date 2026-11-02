// PostToolUse hook: run `eslint --fix` on the .js file Claude just edited.
const { spawnSync } = require("node:child_process");
const path = require("node:path");

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  const filePath = JSON.parse(input).tool_input?.file_path;
  if (!filePath || !filePath.endsWith(".js") || filePath.includes("node_modules")) return;

  const eslint = path.join(process.env.CLAUDE_PROJECT_DIR, "node_modules", "eslint", "bin", "eslint.js");
  // Leftover lint errors are non-blocking here; `npm run lint` catches them.
  spawnSync(process.execPath, [eslint, "--fix", filePath], { cwd: process.env.CLAUDE_PROJECT_DIR });
});

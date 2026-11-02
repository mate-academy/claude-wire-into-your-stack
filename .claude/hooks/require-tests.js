// Stop hook: blocks Claude from finishing while app code has failing tests.
const { execSync } = require("child_process");

let data = "";
process.stdin.on("data", (c) => (data += c));
process.stdin.on("end", () => {
  const input = JSON.parse(data || "{}");

  // Already sent back once; don't loop forever.
  if (input.stop_hook_active) process.exit(0);

  const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  // Only run tests if app code changed.
  const changed = execSync("git status --porcelain", { cwd, encoding: "utf8" });
  if (!/(routes|db|tests)\/.*\.js|server\.js/.test(changed)) process.exit(0);

  try {
    execSync("npm test", { cwd, stdio: "pipe" });
    process.exit(0);
  } catch (e) {
    const out = (e.stdout || "").toString().slice(-1500);
    console.error("Tests are failing. Fix them before finishing.\n" + out);
    process.exit(2);
  }
});
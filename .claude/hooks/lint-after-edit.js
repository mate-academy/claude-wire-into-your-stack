// PostToolUse hook: lint a JavaScript file right after Claude edits or writes it.
// Claude Code passes the tool call as JSON on stdin. Exit code 2 sends stderr
// back to Claude so it fixes the problems; exit code 0 lets it carry on.

const path = require('path');

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// The same files `npm run lint` covers.
const LINTED = [/^server\.js$/, /^routes\//, /^db\//, /^tests\//];

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  const filePath = JSON.parse(input).tool_input?.file_path;
  if (!filePath || !filePath.endsWith('.js')) return 0;

  const rel = path.relative(projectDir, path.resolve(projectDir, filePath)).split(path.sep).join('/');
  if (!LINTED.some((pattern) => pattern.test(rel))) return 0;

  let ESLint;
  try {
    ({ ESLint } = require(path.join(projectDir, 'node_modules', 'eslint')));
  } catch {
    process.stderr.write('lint-after-edit: ESLint is not installed; run npm install. Skipping.\n');
    return 0;
  }

  const eslint = new ESLint({ cwd: projectDir });
  const results = await eslint.lintFiles([path.join(projectDir, rel)]);
  const problems = results.reduce((sum, r) => sum + r.errorCount + r.warningCount, 0);
  if (problems === 0) return 0;

  const formatter = await eslint.loadFormatter('stylish');
  const report = await formatter.format(results);
  process.stderr.write(`ESLint found ${problems} problem(s) in ${rel} after this edit. Fix them before moving on:\n${report}`);
  return 2;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    process.stderr.write(`lint-after-edit failed: ${err.message}\n`);
    process.exit(0);
  },
);

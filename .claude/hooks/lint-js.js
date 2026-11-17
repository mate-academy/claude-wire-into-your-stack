// PostToolUse hook: lint the JS file Claude just edited or wrote.
// Exit 0 = clean (or not a JS file); exit 2 = ESLint errors, fed back to Claude via stderr.

const path = require('path');

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// Read the hook payload (JSON) from stdin.
let raw = '';
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', async () => {
  let filePath;
  try {
    filePath = JSON.parse(raw).tool_input?.file_path;
  } catch {
    process.exit(0); // Unreadable payload: don't block Claude.
  }

  // Only lint .js/.cjs/.mjs files inside this project.
  if (!filePath || !/\.(c|m)?js$/.test(filePath)) process.exit(0);
  const abs = path.resolve(projectDir, filePath);
  const rel = path.relative(projectDir, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel) || rel.split(path.sep)[0] === 'node_modules') {
    process.exit(0);
  }

  // Use the project's own ESLint and eslint.config.js.
  let ESLint;
  try {
    ({ ESLint } = require(path.join(projectDir, 'node_modules', 'eslint')));
  } catch {
    process.stderr.write('lint hook: ESLint not installed (run npm install); skipping.\n');
    process.exit(0);
  }

  const eslint = new ESLint({ cwd: projectDir });
  const results = await eslint.lintFiles([abs]);
  const errorCount = results.reduce((n, r) => n + r.errorCount, 0);
  if (errorCount === 0) process.exit(0);

  // Report errors (and any warnings alongside them) back to Claude.
  const formatter = await eslint.loadFormatter('stylish');
  process.stderr.write(`ESLint found ${errorCount} error(s) in ${rel}. Fix them:\n`);
  process.stderr.write(await formatter.format(results));
  process.exit(2);
});

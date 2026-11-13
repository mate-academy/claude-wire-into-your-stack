// PostToolUse hook: auto-format the file Claude just edited with Prettier.
// Exits 2 with a message on stderr if formatting fails, so Claude sees the failure.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function fail(message) {
  process.stderr.write(`format hook: ${message}\n`);
  process.exit(2);
}

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  let file;
  try {
    file = JSON.parse(input).tool_input.file_path;
  } catch {
    return;
  }
  if (!file) return;
  const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join('/');
  if (rel.startsWith('..') || rel.startsWith('node_modules/')) return;
  if (!/\.(js|json|md)$/.test(rel) || rel.endsWith('package-lock.json')) return;

  const prettier = path.join(root, 'node_modules', 'prettier', 'bin', 'prettier.cjs');
  if (!fs.existsSync(prettier)) {
    fail(`Prettier is not installed (${prettier}); run \`npm install\`. ${rel} was NOT formatted.`);
  }
  const result = spawnSync(process.execPath, [prettier, '--write', rel], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.error) {
    fail(`could not run Prettier on ${rel}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim();
    fail(`Prettier failed on ${rel} (exit ${result.status}):\n${detail}`);
  }
});

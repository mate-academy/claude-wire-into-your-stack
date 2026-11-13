// PostToolUse hook: auto-format the file Claude just edited with Prettier.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

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
  spawnSync(process.execPath, [prettier, '--write', rel], { cwd: root, stdio: 'ignore' });
});

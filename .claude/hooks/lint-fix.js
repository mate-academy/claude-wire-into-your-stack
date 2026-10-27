const { spawnSync } = require('node:child_process');
const path = require('node:path');

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  const payload = JSON.parse(input || '{}');
  const file = payload.tool_input && payload.tool_input.file_path;
  if (!file || !file.endsWith('.js')) return;

  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const rel = path.relative(root, file).split(path.sep).join('/');
  if (!/^(server\.js|routes\/|db\/|tests\/)/.test(rel)) return;

  const eslint = path.join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
  const result = spawnSync(process.execPath, [eslint, '--fix', rel], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout + result.stderr);
    process.exit(2);
  }
});

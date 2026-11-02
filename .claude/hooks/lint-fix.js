// PostToolUse hook: after Claude edits a project JS file, run ESLint --fix on it.
// Unfixable problems go to stderr with exit code 2 so Claude sees and fixes them.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input.file_path;
  } catch {
    process.exit(0);
  }
  if (!filePath || !filePath.endsWith('.js')) process.exit(0);

  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const rel = path.relative(root, filePath).split(path.sep).join('/');
  if (!/^(server\.js|(routes|db|tests)\/)/.test(rel)) process.exit(0);

  const result = spawnSync('npx', ['eslint', '--fix', rel], {
    cwd: root,
    encoding: 'utf8',
    shell: true,
  });
  // ESLint exits 0 on warnings (e.g. no-unused-vars is 'warn'), so also check its output.
  if (result.status !== 0 || result.stdout.trim()) {
    process.stderr.write(result.stdout + result.stderr);
    process.exit(2);
  }
  process.exit(0);
});

// PostToolUse hook: after Claude edits or writes a .js file, run
// `eslint --fix` on it. Fixable problems are fixed in place; anything left
// is sent back to Claude (exit code 2) so it fixes it before moving on.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input?.file_path;
  } catch {
    process.exit(0);
  }
  if (!filePath || !filePath.endsWith('.js')) process.exit(0);

  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const rel = path.relative(root, filePath);
  // Only lint files inside the project, and skip dependencies.
  if (rel.startsWith('..') || path.isAbsolute(rel) || rel.split(path.sep).includes('node_modules')) {
    process.exit(0);
  }

  const eslint = path.join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (!fs.existsSync(eslint)) {
    console.error('lint-fix hook: eslint not installed, run `npm install`');
    process.exit(0);
  }

  const result = spawnSync(process.execPath, [eslint, '--fix', rel], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    console.error(`ESLint found problems in ${rel} that --fix could not solve:\n${result.stdout}${result.stderr}`);
    process.exit(2);
  }
  process.exit(0);
});

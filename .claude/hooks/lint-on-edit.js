// PostToolUse hook: lint any .js file Claude just edited or wrote.
// Reads the hook payload from stdin. On lint errors it prints them to stderr
// and exits 2, which feeds the output back to Claude so it fixes them.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  const file = JSON.parse(input).tool_input?.file_path;
  if (!file || path.extname(file) !== '.js') process.exit(0);

  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const eslintBin = path.join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
  const result = spawnSync(process.execPath, [eslintBin, '--no-warn-ignored', file], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout + result.stderr);
    process.exit(2);
  }
});

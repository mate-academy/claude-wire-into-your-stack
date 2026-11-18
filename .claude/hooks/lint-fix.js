// PostToolUse hook: run `eslint --fix` on any JS file Claude just edited.
// Auto-fixable problems are fixed silently; any error or warning left over is sent back
// to Claude on stderr (exit 2) so it gets corrected in the same turn.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  const filePath = JSON.parse(input).tool_input?.file_path;
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  if (!filePath || path.extname(filePath) !== '.js') return;

  const relative = path.relative(root, filePath);
  if (relative.startsWith('..') || relative.startsWith('node_modules')) return;

  const result = spawnSync('npx', ['eslint', '--fix', '--max-warnings=0', relative], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    process.stderr.write(`eslint found problems in ${relative}:\n${result.stdout}${result.stderr}`);
    process.exit(2);
  }
});

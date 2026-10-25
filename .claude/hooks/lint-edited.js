// PostToolUse hook: lint a JavaScript file right after Claude edits it.
// Claude Code passes the tool call as JSON on stdin. If ESLint fails, we exit 2
// so the error text is fed back to Claude, which then fixes it.
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  const { tool_input: toolInput = {} } = JSON.parse(input || '{}');
  const file = toolInput.file_path;
  if (!file || !file.endsWith('.js')) {
    process.exit(0);
  }

  const result = spawnSync('npx', ['eslint', '--max-warnings', '0', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stdout + result.stderr);
    process.exit(2);
  }
});

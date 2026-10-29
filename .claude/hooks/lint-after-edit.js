// PostToolUse hook: after Claude edits a JS file, auto-fix it with ESLint.
// Remaining lint errors are sent to stderr with exit code 2 so Claude sees and fixes them.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  const event = JSON.parse(input || '{}');
  const file = event.tool_input && event.tool_input.file_path;
  if (!file || !file.endsWith('.js')) return;
  const rel = path.relative(process.cwd(), file);
  // Only files the project lints (see "lint" script in package.json).
  if (!/^(server\.js|routes|db|tests)/.test(rel.replace(/\/g, '/'))) return;

  const result = spawnSync('npx', ['eslint', '--fix', file], {
    encoding: 'utf8',
    shell: true,
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout + result.stderr);
    process.exit(2);
  }
});

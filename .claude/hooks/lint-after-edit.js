// PostToolUse hook: after Claude edits a JS file, run ESLint with --fix on it.
// If problems remain, exit 2 so the lint output is fed back to Claude.
const { spawnSync } = require('node:child_process');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(input).tool_input.file_path;
  } catch {
    process.exit(0);
  }
  if (!file || !file.endsWith('.js')) process.exit(0);

  const res = spawnSync(process.execPath, ['node_modules/eslint/bin/eslint.js', '--fix', '--', file], {
    encoding: 'utf8',
  });
  if (res.status !== 0) {
    console.error(`ESLint found problems in ${file}:\n${res.stdout}${res.stderr}`);
    process.exit(2);
  }
  console.log(`ESLint --fix clean: ${file}`);
});

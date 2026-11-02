// PostToolUse hook: auto-fix lint on any edited JS file in the project.
// Reads the hook payload from stdin; exits 2 (feeding output back to Claude) if lint errors remain.
const { spawnSync } = require('node:child_process');

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(input).tool_input.file_path;
  } catch {
    process.exit(0);
  }
  if (!file || !/\.js$/.test(file) || /node_modules/.test(file) || /[\/]\.claude[\/]/.test(file)) {
    process.exit(0);
  }
  const r = spawnSync('npx', ['eslint', '--fix', file], { encoding: 'utf8', shell: true });
  if (r.status !== 0) {
    process.stderr.write(`ESLint errors in ${file}:\n${r.stdout}${r.stderr}`);
    process.exit(2);
  }
});

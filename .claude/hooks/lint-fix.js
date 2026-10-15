// PostToolUse hook: after Claude edits a .js file, run eslint --fix on it
// so every change lands already conforming to eslint.config.js — nobody has
// to remember to lint before committing.
const { execFileSync } = require('node:child_process');

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath = payload && payload.tool_input && payload.tool_input.file_path;
  if (!filePath || !filePath.endsWith('.js')) {
    process.exit(0);
  }

  try {
    // shell: true is required on Windows, where the "npx" shim is a .cmd
    // file that Node cannot spawn directly without a shell.
    execFileSync('npx', ['eslint', '--fix', filePath], { stdio: 'ignore', shell: true });
  } catch {
    // eslint --fix exits non-zero when issues remain that it can't auto-fix;
    // leave those for the user/CI rather than blocking the edit.
  }
  process.exit(0);
});

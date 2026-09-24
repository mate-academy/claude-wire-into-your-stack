// PostToolUse hook (Edit|Write): auto-fixes lint on the file that was just
// touched, so every edit leaving this repo already holds its ESLint standard.
const path = require('path');
const { execFileSync } = require('child_process');

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

  const cwd = (payload && payload.cwd) || process.cwd();
  const rel = path.relative(cwd, filePath);

  try {
    execFileSync('npx', ['eslint', '--fix', rel], { cwd, stdio: 'inherit' });
  } catch {
    // eslint exits non-zero when it finds unfixable problems; surface them
    // via stdio but never fail the hook chain over a lint warning.
  }
  process.exit(0);
});

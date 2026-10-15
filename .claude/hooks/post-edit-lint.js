// PostToolUse hook: after Edit/Write touches a .js file, run ESLint on it
// immediately and surface any violations, so a problem (unused var,
// undefined reference, etc.) is caught the moment it's introduced instead
// of at the next manual `npm run lint` or in CI.
//
// Not `--fix`: this project's eslint.config.js only pulls in
// `@eslint/js` recommended rules (no-unused-vars, no-undef, and friends),
// none of which are auto-fixable — they're correctness rules, not style
// rules. Auto-fixing here would silently do nothing, so this checks and
// reports instead.
const { execSync } = require('child_process');

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

  const filePath = payload.tool_input && payload.tool_input.file_path;
  if (!filePath || !filePath.endsWith('.js')) {
    process.exit(0);
  }

  try {
    execSync(`npx eslint "${filePath}"`, { stdio: 'inherit' });
  } catch {
    // eslint exits non-zero when it finds a problem; the output already
    // printed via stdio: inherit, so there's nothing more to do here.
  }
  process.exit(0);
});

// PostToolUse hook: lint every JavaScript file Claude edits or writes.
//
// Exit 2 hands ESLint's report back to Claude, which then fixes the problem
// right away instead of the error surfacing later in CI. Warnings do not
// block, matching `npm run lint` in CI. Without installed dependencies the
// hook steps aside so a fresh checkout still works. Files outside the project
// are skipped so ESLint never loads a config from elsewhere.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const eslintBin = path.join(projectDir, 'node_modules', 'eslint', 'bin', 'eslint.js');

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input?.file_path;
  } catch {
    process.stderr.write('lint hook: unreadable hook input\n');
    process.exit(1);
  }
  if (!filePath || !/\.[cm]?js$/.test(filePath)) process.exit(0);

  const relative = path.relative(projectDir, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) process.exit(0);

  if (!fs.existsSync(eslintBin)) {
    process.stderr.write('lint hook skipped: run `npm ci` to install ESLint\n');
    process.exit(1); // non-blocking: shown to the user, the edit stands
  }

  const result = spawnSync(process.execPath, [eslintBin, '--no-warn-ignored', filePath], {
    cwd: projectDir,
    encoding: 'utf8',
  });

  if (result.status === 1) {
    process.stderr.write(`ESLint found errors in ${filePath}; fix them:\n${result.stdout}`);
    process.exit(2);
  }
  if (result.status !== 0) {
    process.stderr.write(`lint hook could not run ESLint:\n${result.error?.message ?? result.stderr}`);
    process.exit(1);
  }
});

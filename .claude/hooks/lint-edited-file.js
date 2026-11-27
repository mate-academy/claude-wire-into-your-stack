// PostToolUse hook: lint the .js file Claude just edited with the project's ESLint config.
// Lint errors exit 2 so Claude sees them and fixes them; anything else never blocks Claude.

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BLOCK_WITH_FEEDBACK = 2;
const NON_BLOCKING_ERROR = 1;
const LINTED_EXTENSIONS = ['.js', '.cjs', '.mjs'];

function readHookInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return null;
  }
}

const hookInput = readHookInput();
const editedFilePath = hookInput && hookInput.tool_input && hookInput.tool_input.file_path;
if (!editedFilePath || !LINTED_EXTENSIONS.includes(path.extname(editedFilePath))) {
  process.exit(0);
}

const projectDir = process.env.CLAUDE_PROJECT_DIR || hookInput.cwd || process.cwd();
const absoluteFilePath = path.resolve(projectDir, editedFilePath);
const isInsideProject = !path.relative(projectDir, absoluteFilePath).startsWith('..');
if (!isInsideProject || !fs.existsSync(absoluteFilePath)) {
  process.exit(0);
}

// Skip quietly before `npm install`, so a fresh checkout is never blocked.
const eslintEntryPoint = path.join(projectDir, 'node_modules', 'eslint', 'bin', 'eslint.js');
if (!fs.existsSync(eslintEntryPoint)) {
  process.exit(0);
}

const eslintRun = spawnSync(
  process.execPath,
  [eslintEntryPoint, '--no-warn-ignored', absoluteFilePath],
  { cwd: projectDir, encoding: 'utf8' },
);

if (eslintRun.status === 0) {
  process.exit(0);
}

const relativeFilePath = path.relative(projectDir, absoluteFilePath);
if (eslintRun.status === 1) {
  console.error(`ESLint errors in ${relativeFilePath} (CI runs the same check). Fix them:\n${eslintRun.stdout}`);
  process.exit(BLOCK_WITH_FEEDBACK);
}

// ESLint itself crashed or could not start: report it, but don't block Claude for a tooling failure.
console.error(`ESLint hook could not lint ${relativeFilePath}:\n${eslintRun.stderr || (eslintRun.error && eslintRun.error.message)}`);
process.exit(NON_BLOCKING_ERROR);

// PostToolUse hook: after Claude edits a .js file, run ESLint --fix on it.
// If problems remain, print them to stderr and exit 2 so Claude sees and fixes them.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const input = JSON.parse(require('node:fs').readFileSync(0, 'utf8'));
const file = input.tool_input && input.tool_input.file_path;

if (!file || !file.endsWith('.js') || file.includes('node_modules')) {
  process.exit(0);
}

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const eslint = path.join(projectDir, 'node_modules', 'eslint', 'bin', 'eslint.js');
const result = spawnSync(process.execPath, [eslint, '--fix', file], {
  cwd: projectDir,
  encoding: 'utf8',
});

if (result.status !== 0) {
  process.stderr.write(result.stdout + result.stderr);
  process.exit(2);
}

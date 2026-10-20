// PostToolUse hook: after Claude writes or edits a .js file, run ESLint --fix on it.
// If problems remain that ESLint can't fix, exit 2 so Claude sees them and fixes them.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input?.file_path;
  } catch {
    process.exit(0);
  }
  if (!filePath || !filePath.endsWith('.js') || filePath.includes('node_modules')) {
    process.exit(0);
  }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const eslint = path.join(projectDir, 'node_modules', 'eslint', 'bin', 'eslint.js');
  const result = spawnSync(process.execPath, [eslint, '--fix', filePath], {
    cwd: projectDir,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    process.stderr.write(`ESLint found problems in ${filePath}:\n${result.stdout}${result.stderr}`);
    process.exit(2);
  }
  process.exit(0);
});

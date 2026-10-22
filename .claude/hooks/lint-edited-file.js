// PostToolUse hook: after Claude edits or writes a .js file, run ESLint with
// --fix on that file. Fixable issues are corrected in place; anything left is
// sent back to Claude (exit code 2 + stderr) so it fixes it before moving on.

const { execFileSync } = require('node:child_process');
const path = require('node:path');

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input?.file_path;
  } catch {
    process.exit(0);
  }
  if (!filePath || !filePath.endsWith('.js')) process.exit(0);

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const relative = path.relative(projectDir, path.resolve(projectDir, filePath));
  if (relative.startsWith('..') || relative.startsWith('node_modules')) {
    process.exit(0);
  }

  try {
    execFileSync('npx', ['eslint', '--fix', relative], {
      cwd: projectDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    process.stderr.write(
      `ESLint found problems in ${relative} that --fix could not solve:\n${err.stdout || err.message}`,
    );
    process.exit(2);
  }
});

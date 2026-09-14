// PostToolUse hook: every .js file Claude edits or writes goes through ESLint.
// Auto-fixable problems are fixed in place; remaining errors are sent back to
// Claude (exit code 2) so it fixes them before moving on.

const path = require('node:path');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
  });
}

async function main() {
  const input = JSON.parse(await readStdin());
  const filePath = input.tool_input && input.tool_input.file_path;
  if (!filePath || path.extname(filePath) !== '.js') return;

  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd;
  const relative = path.relative(projectDir, filePath);
  if (relative.startsWith('..') || relative.split(path.sep).includes('node_modules')) return;

  let ESLint;
  try {
    ({ ESLint } = require(require.resolve('eslint', { paths: [projectDir] })));
  } catch {
    console.error('lint-on-edit: ESLint is not installed — run `npm ci` to enable the lint hook.');
    return;
  }

  const eslint = new ESLint({ cwd: projectDir, fix: true });
  const results = await eslint.lintFiles([filePath]);
  await ESLint.outputFixes(results);

  const formatter = await eslint.loadFormatter('stylish');
  const report = await formatter.format(results);
  const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
  const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);

  if (errorCount > 0) {
    console.error(`ESLint found ${errorCount} error(s) in ${relative}. Fix them before continuing:\n${report}`);
    process.exit(2);
  }

  if (warningCount > 0) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext: `ESLint warnings in ${relative}:\n${report}`,
        },
      }),
    );
  }
}

main().catch((err) => {
  console.error(`lint-on-edit hook failed: ${err.message}`);
});

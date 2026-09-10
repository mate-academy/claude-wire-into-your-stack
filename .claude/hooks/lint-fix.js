const { execFileSync } = require('node:child_process');
const path = require('node:path');

const eslintBin = path.join(
  path.dirname(require.resolve('eslint/package.json')),
  'bin/eslint.js'
);

const LINTED_ROOTS = ['server.js', 'routes', 'db', 'tests'];

function isLinted(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');
  return LINTED_ROOTS.some(
    (root) => normalized === root || normalized.startsWith(`${root}/`)
  );
}

let raw = '';
process.stdin.on('data', (chunk) => {
  raw += chunk;
});

process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !filePath.endsWith('.js')) {
    process.exit(0);
  }

  const relativePath = path.relative(process.cwd(), filePath);
  if (relativePath.startsWith('..') || !isLinted(relativePath)) {
    process.exit(0);
  }

  try {
    const output = execFileSync(process.execPath, [eslintBin, '--fix', filePath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (output.trim()) {
      console.log(output.trim());
    }
    process.exit(0);
  } catch (err) {
    // eslint exits non-zero when it reports remaining (non-autofixable) issues;
    // that's expected and shouldn't block the tool call.
    if (err.stdout?.trim()) {
      console.log(err.stdout.trim());
    }
    process.exit(0);
  }
});

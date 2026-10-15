const fs = require('fs');
const { execSync } = require('child_process');

let input;
try {
  input = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const file =
  (input.tool_input && input.tool_input.file_path) ||
  (input.tool_response && input.tool_response.filePath) ||
  '';
const normalized = file.replace(/\\/g, '/');

if (!/\/(routes|db|tests)\/.*\.js$/.test(normalized)) {
  process.exit(0);
}

try {
  execSync('npm run lint', { stdio: 'inherit' });
} catch {
  // Non-blocking: surface the failure in output, don't undo the edit.
}
process.exit(0);

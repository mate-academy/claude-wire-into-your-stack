const { execSync } = require('child_process');

try {
  execSync('npm test', { stdio: 'pipe' });
  process.exit(0);
} catch (err) {
  const output = `${err.stdout || ''}${err.stderr || ''}`.slice(-2000);
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `npm test is failing — fix tests before pushing.\n${output}`,
      },
    }),
  );
  process.exit(0);
}

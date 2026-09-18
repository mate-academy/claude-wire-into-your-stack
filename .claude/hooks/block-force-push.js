#!/usr/bin/env node
// PreToolUse guard: blocks a force push before it runs.
// Runs on every Bash call; only acts when the command is a plain
// `git push --force`/`-f` (leaves `--force-with-lease` alone, since
// that variant already protects against overwriting others' commits).

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let command = '';
  try {
    command = JSON.parse(input).tool_input?.command || '';
  } catch {
    process.exit(0);
  }

  const isForcePush =
    /\bgit\s+push\b/.test(command) &&
    /(\B-\w*f\w*\b|--force\b)/.test(command) &&
    !/--force-with-lease\b/.test(command);

  if (isForcePush) {
    console.error(
      'Blocked: force push detected ("' + command.trim() + '"). ' +
      'This can overwrite shared history on the remote. ' +
      'Use --force-with-lease if you are sure, or ask the user to run it themselves.'
    );
    process.exit(2);
  }

  process.exit(0);
});

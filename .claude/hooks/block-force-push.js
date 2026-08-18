#!/usr/bin/env node
// PreToolUse guard: blocks `git push --force` (and -f / --force-with-lease)
// so a force-push to this shared repo can't happen without a human explicitly
// overriding the guard themselves.

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const command = payload?.tool_input?.command;
  if (typeof command !== 'string') {
    process.exit(0);
  }

  // Check each shell-separated segment on its own, since `git` and `push`
  // aren't always adjacent (e.g. `git -C dir push --force`).
  const segments = command.split(/&&|\|\||[;|\n]/);
  const isForcePush = segments.some((segment) => {
    const hasGit = /\bgit\b/.test(segment);
    const hasPush = /\bpush\b/.test(segment);
    const hasForce = /(^|\s)(--force\b|--force-with-lease\b|-f\b)/.test(segment);
    return hasGit && hasPush && hasForce;
  });

  if (isForcePush) {
    process.stderr.write(
      "Blocked: force-pushing is not allowed by this project's hook. " +
        'If you really need to force-push, ask the user to run it themselves.',
    );
    process.exit(2);
  }

  process.exit(0);
});

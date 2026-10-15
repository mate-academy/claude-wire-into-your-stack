#!/usr/bin/env node
// PreToolUse hook (matcher: Bash) — blocks `npm publish` so this practice
// package never gets pushed to a real registry by accident.

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let command = '';
  try {
    command = JSON.parse(input).tool_input?.command || '';
  } catch {
    process.exit(0);
  }

  // Only flag `npm publish` when it starts an actual shell command segment
  // (after &&, ||, ;, |, or a newline) — not when the text merely appears
  // inside a quoted string, e.g. a commit message.
  const segments = command.split(/&&|\|\||[;|\n]/);
  const isPublishInvocation = segments.some((segment) => /^\s*npm(\.cmd)?\s+publish\b/.test(segment));

  if (isPublishInvocation) {
    console.error('Blocked: "npm publish" is not allowed on this practice project.');
    process.exit(2);
  }

  process.exit(0);
});
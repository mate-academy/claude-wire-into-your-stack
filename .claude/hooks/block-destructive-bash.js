// PreToolUse hook for the Bash tool. Reads the tool call as JSON on stdin
// and blocks a short list of destructive command patterns (force-push,
// hard reset, recursive force-delete) that shouldn't run without a human
// looking, especially in a headless / no-one-watching session.
//
// Exit code 2 blocks the tool call and returns stderr to Claude as the
// reason; exit code 0 lets it through.

let data = '';
process.stdin.on('data', (chunk) => {
  data += chunk;
});

process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(data.replace(/^﻿/, '') || '{}');
  } catch {
    process.exit(0);
  }

  const command = (input.tool_input && input.tool_input.command) || '';

  const blockedPatterns = [
    /\brm\s+(-\w*r\w*f\w*|-\w*f\w*r\w*)\b/i,
    /\bgit\s+push\s+(--force|-f)\b/i,
    /\bgit\s+reset\s+--hard\b/i,
  ];

  const hit = blockedPatterns.find((pattern) => pattern.test(command));
  if (hit) {
    console.error(
      `Blocked: "${command}" looks destructive (matches ${hit}). ` +
        'Ask the user before running commands like this.'
    );
    process.exit(2);
  }

  process.exit(0);
});

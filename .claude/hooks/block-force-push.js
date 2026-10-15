#!/usr/bin/env node

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const toolName = payload.tool_name;
  if (toolName !== 'Bash' && toolName !== 'PowerShell') {
    process.exit(0);
  }

  const command = payload.tool_input && payload.tool_input.command;
  if (typeof command !== 'string') {
    process.exit(0);
  }

  const segments = command.split(/&&|;|\||\r?\n/);
  const forceFlag = /(?:^|\s)(--force(?:\s|$)|-f(?:\s|$))/;

  for (const segment of segments) {
    if (/\bgit\s+push\b/.test(segment) && forceFlag.test(segment)) {
      process.stderr.write(
        'Blocked: git push --force is disabled by project policy. Use --force-with-lease or ask the user first.\n'
      );
      process.exit(2);
    }
  }

  process.exit(0);
});

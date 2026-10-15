#!/usr/bin/env node
'use strict';

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch (err) {
    process.exit(0);
  }

  const command = (payload.tool_input && payload.tool_input.command) || '';

  if (command.includes('git push --force') || command.includes('git push -f')) {
    process.stderr.write('Blocked: force-pushing (git push --force / -f) is not allowed in this project.\n');
    process.exit(2);
  }

  process.exit(0);
});

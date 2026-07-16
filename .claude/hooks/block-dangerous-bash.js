#!/usr/bin/env node

const fs = require('node:fs');

const input = fs.readFileSync(0, 'utf8');
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

if (/\brm\s+-rf\b/i.test(command)) {
  const result = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: 'Blocked by project hook: rm -rf is not allowed.'
    }
  };

  process.stdout.write(JSON.stringify(result));
}

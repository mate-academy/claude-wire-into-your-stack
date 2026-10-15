#!/usr/bin/env node
/*
 * PreToolUse guard for the Bash tool.
 *
 * Blocks a short list of irreversible or history-rewriting shell commands so
 * that an automated Claude run can't wipe the working tree or clobber the
 * shared branch. Exit 2 tells Claude Code to deny the call and feed the
 * message back; exit 0 lets it through.
 *
 * Cross-platform: invoked as `node .claude/hooks/guard-bash.js`, so it runs
 * the same on Windows and Unix without a shell shebang.
 */
'use strict';

const fs = require('fs');

let raw = '';
try {
  raw = fs.readFileSync(0, 'utf8');
} catch {
  process.exit(0); // no stdin -> nothing to check
}

let command = '';
try {
  command = (JSON.parse(raw).tool_input || {}).command || '';
} catch {
  process.exit(0); // unparseable payload -> don't get in the way
}

const BLOCKED = [
  { re: /\brm\s+-[a-zA-Z]*r[a-zA-Z]*f|\brm\s+-[a-zA-Z]*f[a-zA-Z]*r/, why: 'recursive force delete (rm -rf)' },
  { re: /\bgit\s+push\b[^\n]*\s(--force\b|--force-with-lease=?[^\s]*|-f\b)/, why: 'force push' },
  { re: /\bgit\s+reset\s+--hard\b/, why: 'git reset --hard' },
  { re: /\bgit\s+clean\s+-[a-zA-Z]*f/, why: 'git clean -f' },
  { re: /\bgit\s+checkout\s+--\s/, why: 'git checkout -- (discards file changes)' },
];

for (const { re, why } of BLOCKED) {
  if (re.test(command)) {
    console.error(
      `Blocked by project guard (.claude/hooks/guard-bash.js): ${why}. ` +
        'If you really mean it, run the command yourself outside Claude.'
    );
    process.exit(2);
  }
}

process.exit(0);

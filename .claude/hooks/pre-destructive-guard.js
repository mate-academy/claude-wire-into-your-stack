// PreToolUse hook (Bash): flags commands that could remove or overwrite
// important project files, forcing a confirmation prompt instead of letting
// them run unnoticed.
let data = '';
process.stdin.on('data', (c) => { data += c; });
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(data || '{}'); } catch { input = {}; }
  const cmd = (input.tool_input && input.tool_input.command) || '';

  const patterns = [
    /\brm\s+(-\w*[rf]\w*\s+)+/i,
    /\bgit\s+clean\s+-\w*[fdx]/i,
    /\bgit\s+reset\s+--hard\b/i,
    /\bgit\s+push\s+[^\n]*--force\b/i,
    /\bgit\s+checkout\s+--\s+\.\s*$/i,
    /\bgit\s+restore\s+(--staged\s+)?\.\s*$/i,
    /\bdel\s+\/[a-z]*[fs]/i,
    /\bremove-item\b[^\n]*-recurse[^\n]*-force/i,
    /\brmdir\s+\/s\b/i,
    /\bdrop\s+(table|database)\b/i,
    /\btruncate\s+table\b/i,
    /^\s*>\s*(server\.js|package(-lock)?\.json|routes[\\/]|db[\\/])/i,
  ];

  const hit = patterns.some((p) => p.test(cmd));
  if (hit) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `This command looks like it could remove or overwrite important files: "${cmd}". Confirm this is intended before running it.`,
      },
    }));
  } else {
    console.log('{}');
  }
});
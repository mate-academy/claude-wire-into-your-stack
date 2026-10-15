#!/usr/bin/env node
// PreToolUse guard for the Bash tool. Blocks a small set of commands that are
// hard or impossible to undo, on this project or any other: recursive force
// deletes, rewriting shared git history, discarding uncommitted work, and
// publishing this course repo to a real registry. Everything else is left
// alone — exit 0 lets the command through unchanged.
//
// Exit 2 tells Claude Code to block the tool call and feed our stderr back
// to the model as the reason, instead of running the command.

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    // Malformed input isn't this hook's problem to solve — let it through.
    process.exit(0);
  }

  const command = payload?.tool_input?.command;
  if (typeof command !== 'string') {
    process.exit(0);
  }

  const reason = findBlockReason(command);
  if (reason) {
    process.stderr.write(
      `Blocked by .claude/hooks/guard-bash.js: ${reason}.\n` +
        `Command was: ${command}\n` +
        'If this is really needed, ask the user to run it themselves.\n'
    );
    process.exit(2);
  }

  process.exit(0);
});

function findBlockReason(command) {
  if (isRmRecursiveForce(command)) {
    return 'recursive force delete (rm with both -r and -f, in any flag combination)';
  }
  if (/\bgit\s+push\b.*(--force(-with-lease)?\b|(?<!--)\s-f\b)/i.test(command)) {
    return 'force push (rewrites shared history)';
  }
  if (/\bgit\s+reset\s+--hard\b/i.test(command)) {
    return 'git reset --hard (discards uncommitted work)';
  }
  if (/\bgit\s+clean\s+(?=.*-[a-z]*f)(?=.*-[a-z]*d)/i.test(command)) {
    return 'git clean -fd (deletes untracked files)';
  }
  if (/\bnpm\s+publish\b/i.test(command)) {
    return 'npm publish (would publish this course repo)';
  }
  return null;
}

// Catches `rm -rf`, `rm -fr`, and `rm -r -f`/`rm -r --force`/etc — recursive
// and force can be spelled as one combined flag or two separate ones.
function isRmRecursiveForce(command) {
  const pieces = command.split(/&&|\|\||;|\|/);
  for (const piece of pieces) {
    const tokens = piece.trim().split(/\s+/);
    const rmIdx = tokens.findIndex((t) => t === 'rm' || t.endsWith('/rm'));
    if (rmIdx === -1) continue;

    let recursive = false;
    let force = false;
    for (let i = rmIdx + 1; i < tokens.length; i += 1) {
      const t = tokens[i];
      if (t === '--recursive' || /^-[a-z]*r[a-z]*$/i.test(t)) recursive = true;
      if (t === '--force' || /^-[a-z]*f[a-z]*$/i.test(t)) force = true;
    }
    if (recursive && force) return true;
  }
  return false;
}

#!/usr/bin/env node
// PreToolUse hook: block force-pushes that would overwrite the main branch.
// Reads the tool call as JSON on stdin. Exit 2 blocks the call and shows stderr to Claude.
const { execSync } = require('child_process');

const PROTECTED = 'main';

function currentBranch(cwd) {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

// Does this refspec's destination name the protected branch?
function targetsProtected(refspec) {
  const dest = refspec.replace(/^\+/, '').split(':').pop();
  return dest === PROTECTED || dest === `refs/heads/${PROTECTED}`;
}

function isForcePush(segment, cwd) {
  const tokens = segment.trim().split(/\s+/).map((t) => t.replace(/^['"]|['"]$/g, ''));
  const gitAt = tokens.indexOf('git');
  if (gitAt === -1) return false;
  const pushAt = tokens.indexOf('push', gitAt + 1);
  if (pushAt === -1) return false;

  const args = tokens.slice(pushAt + 1);
  const flags = args.filter((a) => a.startsWith('-'));
  const positional = args.filter((a) => !a.startsWith('-'));
  const refspecs = positional.slice(1); // first positional is the remote

  const forceFlag = flags.some(
    (f) => /^--force(-with-lease|-if-includes)?(=.*)?$/.test(f) || /^-[a-zA-Z]*f[a-zA-Z]*$/.test(f),
  );
  const forcedRefspec = refspecs.some((r) => r.startsWith('+') && targetsProtected(r));
  const mirror = flags.includes('--mirror');

  if (forcedRefspec || (mirror && forceFlag)) return true;
  if (!forceFlag) return false;
  if (refspecs.length === 0 || flags.includes('--all')) {
    // No explicit branch: git pushes the current branch.
    return flags.includes('--all') || currentBranch(cwd) === PROTECTED;
  }
  return refspecs.some(targetsProtected);
}

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }
  const command = payload?.tool_input?.command;
  if (typeof command !== 'string') process.exit(0);

  const segments = command.split(/&&|\|\||[;|\n]/);
  if (segments.some((s) => isForcePush(s, payload.cwd || process.cwd()))) {
    process.stderr.write(
      `Blocked: force-pushing to '${PROTECTED}' would overwrite its history. ` +
        `Push to a feature branch and open a pull request instead.\n`,
    );
    process.exit(2);
  }
  process.exit(0);
});

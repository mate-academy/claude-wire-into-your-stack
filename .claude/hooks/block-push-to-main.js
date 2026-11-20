#!/usr/bin/env node
// PreToolUse hook (Bash): block any `git push` that would update the main branch.
// Exit 2 blocks the tool call; stderr is shown to Claude as the reason.
const { execFileSync } = require('node:child_process');

const PROTECTED = 'main';

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0); // not our business if the payload is unreadable
  }
  const command = (input.tool_input && input.tool_input.command) || '';
  const cwd = input.cwd || process.cwd();

  // Look at each simple command separately: `a && git push ... ; b`.
  for (const segment of command.split(/&&|\|\||;|\||\n/)) {
    const reason = checkSegment(segment.trim(), cwd);
    if (reason) {
      process.stderr.write(
        `Blocked: ${reason}. Pushing to "${PROTECTED}" is not allowed on this project. ` +
          'Push a feature branch and open a pull request instead.\n',
      );
      process.exit(2);
    }
  }
  process.exit(0);
});

function checkSegment(segment, cwd) {
  const tokens = segment.split(/\s+/).filter(Boolean);
  const gitAt = tokens.indexOf('git');
  if (gitAt === -1) return null;

  // Skip git's global options (e.g. `git -C dir push`) to find the subcommand.
  let i = gitAt + 1;
  let repoDir = cwd;
  while (i < tokens.length && tokens[i].startsWith('-')) {
    if (tokens[i] === '-C' && tokens[i + 1]) {
      repoDir = require('node:path').resolve(cwd, tokens[i + 1]);
      i += 2;
    } else if (tokens[i] === '-c') {
      i += 2;
    } else {
      i += 1;
    }
  }
  if (tokens[i] !== 'push') return null;

  const args = tokens.slice(i + 1);
  if (args.includes('--all') || args.includes('--mirror')) {
    return 'git push --all/--mirror would update main';
  }

  const positional = args.filter((a) => !a.startsWith('-'));
  const refspecs = positional.slice(1); // first positional is the remote

  if (refspecs.length === 0) {
    // Plain `git push` / `git push origin` pushes the current branch.
    return currentBranch(repoDir) === PROTECTED ? `"git push" from the ${PROTECTED} branch` : null;
  }

  for (const spec of refspecs) {
    const cleaned = spec.replace(/^\+/, '').replace(/^['"]|['"]$/g, '');
    const [src, dst] = cleaned.includes(':') ? cleaned.split(':') : [cleaned, cleaned];
    const target = dst.replace(/^refs\/heads\//, '');
    if (target === PROTECTED) return `push targets ${PROTECTED}`;
    if (target === 'HEAD' && src === 'HEAD' && currentBranch(repoDir) === PROTECTED) {
      return `push of HEAD while on ${PROTECTED}`;
    }
  }
  return null;
}

function currentBranch(dir) {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

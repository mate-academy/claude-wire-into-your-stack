#!/usr/bin/env node
// PreToolUse hook (Bash): block any `git push` that would update the main branch.
//
// It checks both the local branch being pushed and where the push actually lands
// on the remote, resolving the destination the way git does: explicit refspecs,
// remote.<name>.push refspecs, push.default (simple/current/upstream/matching),
// branch.<name>.merge, pushRemote/pushDefault, and @{push}. So a feature branch
// whose upstream is main can't slip through with a bare `git push`.
//
// Exit 2 blocks the tool call; stderr is shown to Claude as the reason.
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const PROTECTED = 'main';
// Push options that take a separate value, so the value isn't mistaken for a remote or refspec.
const OPTS_WITH_VALUE = new Set(['-o', '--push-option', '--repo', '--receive-pack', '--exec']);

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const command = (input.tool_input && input.tool_input.command) || '';
  const cwd = input.cwd || process.cwd();

  // Look at each simple command separately: `a && git push ... ; b`.
  for (const segment of command.split(/&&|\|\||;|\||\n/)) {
    const reason = checkSegment(segment.trim(), cwd);
    if (reason) {
      process.stderr.write(
        `Blocked: ${reason}. Pushing to "${PROTECTED}" is not allowed on this project. ` +
          'Push a feature branch to a branch of the same name and open a pull request instead.\n',
      );
      process.exit(2);
    }
  }
  process.exit(0);
});

function checkSegment(segment, cwd) {
  const tokens = segment.split(/\s+/).filter(Boolean).map(unquote);
  const gitAt = tokens.indexOf('git');
  if (gitAt === -1) return null;

  // Skip git's global options (e.g. `git -C dir push`) to find the subcommand.
  let i = gitAt + 1;
  let dir = cwd;
  while (i < tokens.length && tokens[i].startsWith('-')) {
    if (tokens[i] === '-C' && tokens[i + 1]) {
      dir = path.resolve(dir, tokens[i + 1]);
      i += 2;
    } else if (tokens[i] === '-c') {
      i += 2;
    } else {
      i += 1;
    }
  }
  if (tokens[i] !== 'push') return null;

  const git = (...args) => run(dir, args);
  const args = tokens.slice(i + 1);
  const positional = [];
  let remoteOpt = null;
  for (let k = 0; k < args.length; k++) {
    const a = args[k];
    if (a === '--all' || a === '--branches' || a === '--mirror') {
      return `git push ${a} would update ${PROTECTED}`;
    }
    if (a.startsWith('--repo=')) remoteOpt = a.slice('--repo='.length);
    else if (a === '--repo') remoteOpt = args[++k];
    else if (OPTS_WITH_VALUE.has(a)) k++;
    else if (!a.startsWith('-')) positional.push(a);
  }

  const current = git('symbolic-ref', '--quiet', '--short', 'HEAD'); // null when detached
  const remote =
    remoteOpt ||
    positional[0] ||
    (current && (cfg(git, `branch.${current}.pushRemote`) || cfg(git, 'remote.pushDefault') || cfg(git, `branch.${current}.remote`))) ||
    'origin';
  const refspecs = remoteOpt ? positional : positional.slice(1);
  const pushDefault = cfg(git, 'push.default') || 'simple';
  const configured = cfgAll(git, `remote.${remote}.push`);

  if (refspecs.length === 0) {
    // Unqualified push: what gets pushed comes from config.
    if (current === PROTECTED) return `"git push" from the local ${PROTECTED} branch`;
    if (configured.length > 0) {
      for (const spec of configured) {
        if (destFromConfigured(spec, current) === PROTECTED) {
          return `remote.${remote}.push (${spec}) sends ${current || 'HEAD'} to ${PROTECTED}`;
        }
      }
      return null;
    }
    if (pushDefault === 'matching') {
      return git('rev-parse', '--verify', '--quiet', `refs/heads/${PROTECTED}`)
        ? `push.default=matching would also push the local ${PROTECTED} branch`
        : null;
    }
    if (!current || pushDefault === 'nothing') return null;
    const dest = destForBranch(git, current, pushDefault);
    if (dest === PROTECTED) return `"${current}" is configured to push to ${PROTECTED} (push.default=${pushDefault})`;
    const atPush = git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{push}');
    if (atPush && atPush.split('/').slice(1).join('/') === PROTECTED) {
      return `"${current}" pushes to ${atPush} (@{push})`;
    }
    return null;
  }

  for (const spec of refspecs) {
    const cleaned = spec.replace(/^\+/, '');
    if (cleaned.includes(':')) {
      const [src, dst] = cleaned.split(':');
      const target = dst === '' ? null : stripHeads(dst === 'HEAD' ? current || '' : dst);
      if (target === PROTECTED) return `refspec "${spec}" targets ${PROTECTED}`;
      if (stripHeads(src) === PROTECTED && dst === '') continue; // `main:` is a no-op form
      continue;
    }
    // Source-only refspec: git chooses the destination.
    const src = stripHeads(cleaned === 'HEAD' ? current || 'HEAD' : cleaned);
    if (src === PROTECTED) return `pushing the local ${PROTECTED} branch`;
    const mapped = configured.map((c) => destFromConfigured(c, src)).find(Boolean);
    if (mapped === PROTECTED) return `remote.${remote}.push maps "${src}" to ${PROTECTED}`;
    if (!mapped && pushDefault === 'upstream' && src === current) {
      const upstream = stripHeads(cfg(git, `branch.${current}.merge`) || '');
      if (upstream === PROTECTED) return `"${current}" pushes to its upstream ${PROTECTED} (push.default=upstream)`;
    }
  }
  return null;
}

// Destination branch for an unqualified push of `branch` under push.default.
function destForBranch(git, branch, pushDefault) {
  if (pushDefault === 'upstream' || pushDefault === 'tracking') {
    return stripHeads(cfg(git, `branch.${branch}.merge`) || '');
  }
  return branch; // simple and current push to a branch of the same name
}

// Apply a configured push refspec (e.g. "refs/heads/*:refs/heads/main", "HEAD:main") to a source branch.
function destFromConfigured(spec, branch) {
  const [rawSrc, rawDst] = spec.replace(/^\+/, '').split(':');
  const src = rawSrc === 'HEAD' ? branch : stripHeads(rawSrc);
  const dst = stripHeads(rawDst === undefined ? rawSrc : rawDst);
  if (!branch) return null;
  if (src.includes('*')) {
    const [pre, post] = src.split('*');
    if (!branch.startsWith(pre) || !branch.endsWith(post)) return null;
    return dst.replace('*', branch.slice(pre.length, branch.length - post.length));
  }
  return src === branch ? dst : null;
}

function stripHeads(ref) {
  return ref.replace(/^refs\/heads\//, '');
}

function unquote(s) {
  return s.replace(/^['"]|['"]$/g, '');
}

function cfg(git, key) {
  return git('config', '--get', key);
}

function cfgAll(git, key) {
  const out = git('config', '--get-all', key);
  return out ? out.split('\n').filter(Boolean) : [];
}

function run(dir, args) {
  try {
    return execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null;
  } catch {
    return null;
  }
}

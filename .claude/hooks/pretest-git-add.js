'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function allow() {
  process.exit(0);
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

function shellSplit(str) {
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  const tokens = [];
  let m;
  while ((m = re.exec(str))) {
    tokens.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]);
  }
  return tokens;
}

function gitChangedFiles(pathspecs) {
  const args = ['status', '--porcelain', '--untracked-files=all'];
  if (pathspecs && pathspecs.length) args.push('--', ...pathspecs);
  let out;
  try {
    out = execFileSync('git', args, { encoding: 'utf8' });
  } catch {
    return [];
  }
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

function relatedTestFile(file) {
  const normalized = file.replace(/\\/g, '/');
  if (/^tests\/.*\.test\.js$/.test(normalized)) return normalized;
  const base = path.basename(normalized).replace(/\.[^.]+$/, '');
  const candidate = path.join('tests', `${base}.test.js`);
  return fs.existsSync(candidate) ? candidate.replace(/\\/g, '/') : null;
}

let payload;
try {
  payload = JSON.parse(readStdin());
} catch {
  allow();
}

const command = (payload && payload.tool_input && payload.tool_input.command) || '';
const match = command.match(/git\s+add\s+(.*)$/s);
if (!match) allow();

const argsPart = match[1].split(/&&|;|\|/)[0].trim();
const tokens = argsPart.length ? shellSplit(argsPart) : [];

const ALL_FLAGS = new Set(['-A', '--all', '-u', '--update']);
let allMode = false;
const pathArgs = [];
for (const t of tokens) {
  if (t === '.') {
    allMode = true;
    continue;
  }
  if (ALL_FLAGS.has(t)) {
    allMode = true;
    continue;
  }
  if (t.startsWith('-')) continue;
  pathArgs.push(t);
}
if (pathArgs.length === 0 && !allMode) allMode = true;

const changedFiles = allMode ? gitChangedFiles([]) : gitChangedFiles(pathArgs);
if (changedFiles.length === 0) allow();

const testFiles = [...new Set(changedFiles.map(relatedTestFile).filter(Boolean))];
if (testFiles.length === 0) allow();

let output = '';
let code = 0;
try {
  output = execFileSync('node', ['--test', ...testFiles], { encoding: 'utf8' });
} catch (err) {
  code = err.status || 1;
  output = (err.stdout || '') + (err.stderr || '');
}

if (code !== 0) {
  deny(`Related tests failed (${testFiles.join(', ')}):\n${output}`);
} else {
  allow();
}

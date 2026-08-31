#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.dirname(path.dirname(__dirname));
const mocksLink = path.join(repoRoot, 'mocks');
const rootProject = process.env.ROOT_PROJECT;

function isSymlinkValid() {
  if (!fs.existsSync(mocksLink)) {
    return false;
  }

  try {
    const stat = fs.lstatSync(mocksLink);
    if (!stat.isSymbolicLink()) {
      return false;
    }

    if (!rootProject) {
      return true;
    }

    const target = fs.readlinkSync(mocksLink);
    const expectedTarget = path.join(rootProject, 'task---mock-db');
    return target === expectedTarget;
  } catch (err) {
    return false;
  }
}

if (isSymlinkValid()) {
  process.exit(0);
}

if (!rootProject) {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: 'ROOT_PROJECT is not set. Set it to the path of your root project (where task---mock-db is/will be located): export ROOT_PROJECT=/path/to/root-project. Then retry.',
    },
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}

try {
  const setupScript = path.join(__dirname, '..', 'start-filesystem-mcp.js');
  execSync(`node "${setupScript}" --setup-only`, {
    stdio: 'inherit',
    cwd: repoRoot,
  });
  process.exit(0);
} catch (err) {
  console.error('Failed to set up mocks:', err.message);
  process.exit(0);
}

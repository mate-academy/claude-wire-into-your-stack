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
  console.error('⚠️  Mocks MCP is not set up.');
  console.error('The mock-db-filesystem MCP server requires ROOT_PROJECT to be set.');
  console.error('');
  console.error('Set it to the path of your root project (where task---mock-db is/will be located):');
  console.error('  export ROOT_PROJECT=/path/to/root-project');
  console.error('');
  console.error('Then reload/restart your Claude Code session.');
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

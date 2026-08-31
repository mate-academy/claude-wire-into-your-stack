#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootProject = process.env.ROOT_PROJECT;
if (!rootProject) {
  console.error('ERROR: ROOT_PROJECT environment variable is not set.');
  console.error('Please set it to the repository root path:');
  console.error('  export ROOT_PROJECT=$(pwd)');
  console.error('Then run this script again.');
  process.exit(1);
}

const mockDbDir = path.join(rootProject, 'task---mock-db');
const repoRoot = path.dirname(__dirname);
const mocksLink = path.join(repoRoot, 'mocks');

try {
  fs.mkdirSync(mockDbDir, { recursive: true });
  console.log(`✓ Mock database directory: ${mockDbDir}`);
} catch (err) {
  console.error(`Failed to create ${mockDbDir}:`, err.message);
  process.exit(1);
}

try {
  if (fs.existsSync(mocksLink)) {
    const stat = fs.lstatSync(mocksLink);
    if (stat.isSymbolicLink()) {
      const target = fs.readlinkSync(mocksLink);
      if (target !== mockDbDir) {
        fs.unlinkSync(mocksLink);
        fs.symlinkSync(mockDbDir, mocksLink);
        console.log(`✓ Updated symlink: mocks → ${mockDbDir}`);
      } else {
        console.log(`✓ Symlink already correct: mocks → ${mockDbDir}`);
      }
    } else {
      console.error('ERROR: mocks/ exists but is not a symlink. Remove it and try again.');
      process.exit(1);
    }
  } else {
    fs.symlinkSync(mockDbDir, mocksLink);
    console.log(`✓ Created symlink: mocks → ${mockDbDir}`);
  }
} catch (err) {
  console.error(`Failed to set up symlink:`, err.message);
  process.exit(1);
}

if (process.argv.includes('--setup-only')) {
  console.log(`✓ Mocks setup complete. MCP server will be started separately.`);
  process.exit(0);
}

console.log(`Starting filesystem MCP server on ${mockDbDir}...`);
try {
  execSync(`npx -y @modelcontextprotocol/server-filesystem "${mockDbDir}"`, {
    stdio: 'inherit',
  });
} catch (err) {
  console.error('Failed to start MCP server:', err.message);
  process.exit(1);
}

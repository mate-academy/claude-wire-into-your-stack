#!/usr/bin/env node
// Print a `tree`-style listing of the repo (or one directory in it) without the external
// `tree` program. Uses git's file list, so dotfiles are included while .git and anything
// in .gitignore (node_modules, .env, ...) are left out.
// Usage: node .claude/scripts/tree.js [directory]
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const target = (process.argv[2] || '.').replace(/\/+$/, '') || '.';

let root;
let files;
try {
  root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd: root,
    encoding: 'utf8',
  })
    .split('\0')
    .filter((f) => f && fs.existsSync(path.join(root, f))); // skip deleted-but-staged files
} catch {
  console.error('tree: not inside a git repository');
  process.exit(1);
}

const prefix = path.relative(root, path.resolve(process.cwd(), target));
if (prefix.startsWith('..')) {
  console.error(`tree: ${target} is outside the repository`);
  process.exit(1);
}
const scoped = prefix ? files.filter((f) => f.startsWith(prefix + '/')).map((f) => f.slice(prefix.length + 1)) : files;
if (prefix && scoped.length === 0) {
  console.error(`tree: ${target}: no such directory, or it has no tracked files`);
  process.exit(1);
}

// Build a nested object: directories are objects, files are null.
const treeRoot = {};
for (const file of scoped) {
  const parts = file.split('/');
  let node = treeRoot;
  parts.forEach((part, i) => {
    if (i === parts.length - 1) node[part] = null;
    else node = node[part] = node[part] || {};
  });
}

let dirs = 0;
let count = 0;
const lines = [target];
// Same order as `tree`: case-insensitive by name, dirs and files mixed.
const sortKey = (name) => name.replace(/^\./, '').toLowerCase();
(function walk(node, indent) {
  const names = Object.keys(node).sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  names.forEach((name, i) => {
    const last = i === names.length - 1;
    lines.push(`${indent}${last ? '└── ' : '├── '}${name}`);
    if (node[name]) {
      dirs++;
      walk(node[name], indent + (last ? '    ' : '│   '));
    } else {
      count++;
    }
  });
})(treeRoot, '');

console.log(lines.join('\n'));
console.log(`\n${dirs} ${dirs === 1 ? 'directory' : 'directories'}, ${count} ${count === 1 ? 'file' : 'files'}`);

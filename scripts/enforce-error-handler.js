#!/usr/bin/env node
'use strict';

// PostToolUse hook: after any Edit or Write, ensure every function in the
// modified .js file has a try/catch that calls logError. Patches missing ones
// in-place. Skips the file if acorn can't parse it or the patch produces
// invalid JS (fail-safe: never corrupt a file).

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

// --- Read hook payload from stdin ---
let payload;
try {
  payload = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const filePath = payload?.tool_input?.file_path;
if (!filePath) process.exit(0);

// Only .js files, not tests, not the logger/script themselves
if (!/\.js$/.test(filePath)) process.exit(0);
if (/\.test\.js$/.test(filePath)) process.exit(0);
const base = path.basename(filePath);
if (base === 'logger.js' || base === 'enforce-error-handler.js') process.exit(0);

let src;
try {
  src = fs.readFileSync(filePath, 'utf8');
} catch {
  process.exit(0);
}

// Only process files that already import the logger (opt-in)
if (!src.includes("logError")) process.exit(0);

// --- Parse ---
let ast;
try {
  ast = acorn.parse(src, { ecmaVersion: 2020, sourceType: 'script' });
} catch {
  process.exit(0);
}

// --- Walk AST and collect patches ---
const patches = [];

function getFnInfo(node, parent) {
  if (node.type === 'FunctionDeclaration') {
    return { name: node.id?.name || 'anonymous', isRoute: false };
  }
  // Route handler: router.METHOD('path', fn)
  if (parent?.type === 'CallExpression') {
    const callee = parent.callee;
    if (callee?.type === 'MemberExpression') {
      const method = callee.property?.name;
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
        const routeArg = parent.arguments.find(a => a.type === 'Literal');
        if (routeArg) {
          return { name: `${method.toUpperCase()} ${routeArg.value}`, isRoute: true };
        }
      }
    }
  }
  // const foo = () => {}  or  const foo = function() {}
  if (parent?.type === 'VariableDeclarator' && parent.id?.name) {
    return { name: parent.id.name, isRoute: false };
  }
  return { name: 'anonymous', isRoute: false };
}

function walk(node, parent) {
  if (!node || typeof node !== 'object') return;

  const isFn =
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression';

  if (isFn && node.body?.type === 'BlockStatement') {
    const first = node.body.body[0];
    if (!first || first.type !== 'TryStatement') {
      const { name, isRoute } = getFnInfo(node, parent);
      patches.push({ bodyStart: node.body.start, bodyEnd: node.body.end, name, isRoute });
    }
  }

  for (const key of Object.keys(node)) {
    if (key === 'type') continue;
    const val = node[key];
    if (!val || typeof val !== 'object') continue;
    if (Array.isArray(val)) {
      val.forEach(child => { if (child?.type) walk(child, node); });
    } else if (val.type) {
      walk(val, node);
    }
  }
}

walk(ast, null);
if (patches.length === 0) process.exit(0);

// --- Apply patches end-to-start so earlier offsets stay valid ---
patches.sort((a, b) => b.bodyStart - a.bodyStart);

let result = src;
for (const p of patches) {
  const inner = result.slice(p.bodyStart + 1, p.bodyEnd - 1);

  // Detect indentation from the first non-empty line inside the body
  const lines = inner.split('\n');
  const nonEmpty = lines.filter(l => l.trim().length > 0);
  const indent = nonEmpty.length > 0 ? nonEmpty[0].match(/^(\s*)/)[1] : '  ';
  const extra = '  '; // one extra level inside try {}

  // Re-indent existing body lines by one extra level
  const reindented = lines
    .map(l => (l.trim() === '' ? l : extra + l))
    .join('\n');

  const catchBody = p.isRoute
    ? `\n${indent}${extra}logError('${p.name}', err);\n${indent}${extra}return res.status(500).json({ error: 'Internal server error' });\n${indent}`
    : `\n${indent}${extra}logError('${p.name}', err);\n${indent}${extra}throw err;\n${indent}`;

  const wrapped = `\n${indent}try {${reindented}${indent}} catch (err) {${catchBody}}\n`;

  result =
    result.slice(0, p.bodyStart + 1) +
    wrapped +
    result.slice(p.bodyEnd - 1);
}

// --- Safety check: verify result is still valid JS before writing ---
try {
  acorn.parse(result, { ecmaVersion: 2020, sourceType: 'script' });
} catch {
  // Patching produced invalid JS — bail out rather than corrupting the file
  process.stderr.write(`[enforce-error-handler] patch produced invalid JS in ${filePath}, skipping\n`);
  process.exit(0);
}

fs.writeFileSync(filePath, result, 'utf8');
console.log(`[enforce-error-handler] added try/catch to ${patches.length} function(s) in ${path.basename(filePath)}`);

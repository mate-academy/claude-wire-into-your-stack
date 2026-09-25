#!/usr/bin/env node
// PostToolUse hook: after a file is written/edited, flag any mid-line double
// spaces so Claude notices and can clean them up. Ignores leading indentation
// and trailing whitespace — only flags a non-space, 2+ spaces, non-space.

const fs = require('fs');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath = data?.tool_input?.file_path;
  if (!filePath || !fs.existsSync(filePath)) process.exit(0);

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    process.exit(0);
  }

  const doubleSpace = /\S {2,}\S/;
  const hits = [];
  content.split('\n').forEach((line, i) => {
    if (doubleSpace.test(line)) hits.push(`  line ${i + 1}: ${line.trim()}`);
  });

  if (hits.length === 0) process.exit(0);

  console.error(
    `Double spaces found in ${filePath}:\n${hits.join('\n')}\nPlease clean these up.`
  );
  process.exit(2);
});

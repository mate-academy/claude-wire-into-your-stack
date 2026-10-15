#!/usr/bin/env node
// Counts data rows in a CSV file (total lines minus the header row).
const fs = require('fs');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/count-rows.js <file.csv>');
  process.exit(1);
}

let contents;
try {
  contents = fs.readFileSync(file, 'utf8');
} catch (err) {
  console.error(`Could not read ${file}: ${err.message}`);
  process.exit(1);
}

const lines = contents.split(/\r?\n/).filter((line) => line.length > 0);
const rowCount = Math.max(lines.length - 1, 0);

console.log(rowCount);

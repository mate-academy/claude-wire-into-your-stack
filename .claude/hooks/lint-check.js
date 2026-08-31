#!/usr/bin/env node
"use strict";

const { spawnSync } = require("child_process");

const result = spawnSync("npm", ["run", "lint"], {
  cwd: __dirname + "/../..",
  encoding: "utf8",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason: `Lint check failed (npm run lint). Fix the issues below before continuing:\n\n${output}`,
    })
  );
}

process.exit(0);

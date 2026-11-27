let raw = "";
process.stdin.on("data", (chunk) => {
  raw += chunk;
});

process.stdin.on("end", () => {
  let command = "";
  try {
    command = JSON.parse(raw).tool_input.command || "";
  } catch {
    process.exit(0);
  }

  const risky = [
    { pattern: /\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/i, reason: "recursive force delete (rm -rf)" },
    { pattern: /\bgit\s+push\b.*(--force\b|-f\b)/, reason: "force push" },
    { pattern: /\bgit\s+reset\s+--hard\b/, reason: "git reset --hard" },
  ];

  const hit = risky.find((rule) => rule.pattern.test(command));
  if (hit) {
    console.error(`Blocked by project hook: ${hit.reason} is not allowed in this repo.`);
    process.exit(2);
  }
});

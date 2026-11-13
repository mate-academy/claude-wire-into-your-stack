import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

// Read-only: this server only uses fs.readdir / fs.stat / fs.readFile.
// No write, delete, or rename operations exist anywhere in this file.
// DOCS_DIR is optional; "~" is expanded here because MCP env values are passed through literally.
function expandHome(p) {
  return p === "~" || p.startsWith("~/") || p.startsWith("~\\") ? path.join(os.homedir(), p.slice(1)) : p;
}
const DOCS_DIR = path.resolve(
  process.env.DOCS_DIR
    ? expandHome(process.env.DOCS_DIR)
    : path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "docs"),
);
const MAX_BYTES = 1024 * 1024; // refuse files larger than 1 MB

/** Resolve a user-supplied relative path, rejecting anything outside DOCS_DIR. */
async function resolveSafe(relPath) {
  const root = await fs.realpath(DOCS_DIR);
  const target = await fs.realpath(path.resolve(root, relPath));
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw new Error("Access denied: path is outside the docs directory");
  }
  return target;
}

async function walk(dir, root) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, root)));
    else if (entry.isFile()) out.push(path.relative(root, full).split(path.sep).join("/"));
  }
  return out;
}

const text = (t, isError = false) => ({
  content: [{ type: "text", text: t }],
  ...(isError && { isError: true }),
});

const server = new McpServer({ name: "docs-readonly", version: "1.0.0" });

server.registerTool(
  "list_docs",
  {
    description: "List all files in the docs folder (read-only).",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async () => {
    try {
      const root = await fs.realpath(DOCS_DIR);
      const files = await walk(root, root);
      return text(files.length ? files.join("\n") : "(no files)");
    } catch (e) {
      return text(`Error: ${e.message}`, true);
    }
  },
);

server.registerTool(
  "read_doc",
  {
    description: "Read a file from the docs folder by its relative path (read-only).",
    inputSchema: { path: z.string().describe("Path relative to the docs folder, e.g. api.md") },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async ({ path: rel }) => {
    try {
      const target = await resolveSafe(rel);
      const stat = await fs.stat(target);
      if (!stat.isFile()) return text("Error: not a file", true);
      if (stat.size > MAX_BYTES) return text("Error: file exceeds 1 MB limit", true);
      return text(await fs.readFile(target, "utf8"));
    } catch (e) {
      const msg = e.code === "ENOENT" ? "File not found" : e.message;
      return text(`Error: ${msg}`, true);
    }
  },
);

await server.connect(new StdioServerTransport());

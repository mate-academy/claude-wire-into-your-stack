# Notes

## Server (MCP)

Connected `@modelcontextprotocol/server-fetch` — a credential-free server that lets Claude fetch external URLs. On this project it is useful for pulling in Express or Node.js documentation while working on routes. The permission rule allows only `mcp__fetch__fetch`, the single read-only tool the server exposes, rather than blanket-allowing the whole server.

## Skill

The `add-route` skill captures how a new resource is wired into this API: create the router file, mount it in `server.js`, go through `db/store.js` for data access, validate input and return shaped error responses, and mirror the test structure. The description fires on requests that mention adding a route, endpoint, or resource — specific enough to avoid triggering on unrelated questions about the API.

## Command

`/new-route <resource>` scaffolds a complete route, store helpers, server mount, and test file for a named resource. It is worth a shortcut because adding a route is the most common extension task on this project and every step is predictable — the command saves re-explaining the conventions each time.

## Hook

A `PostToolUse` hook watches `Edit` and `Write` tool calls and runs `eslint --fix` on the file that was just written. It reacts (not prevents), so it never blocks a save — it just keeps the linter clean automatically. The event is `PostToolUse` because ESLint needs to see the finished file content, not intercept it mid-flight.

## Headless run

Task run: generate the API documentation summary from the existing routes.

```
claude -p "List every route exposed by this API with its method, path, and what it returns. Read server.js and routes/*.js only." \
  --allowedTools "Read,Glob"
```

Allowed `Read` and `Glob` only — the task is pure inspection; no writes, no shell access, no network needed.

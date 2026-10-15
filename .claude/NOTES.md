# Claude Code Integration Guide

This document outlines all four integrations that wire Claude Code features into the Course API project.

## Integration Overview

### 1. Skill: Route Scaffolding (`skills/route-scaffold/SKILL.md`)

**Purpose:** Teach Claude the exact patterns for creating new routes that follow this project's conventions.

**When to use:** Ask Claude to create a new route, add a new endpoint, or scaffold a new resource handler.

**Key features:**
- Teaches CRUD endpoint patterns (GET list, GET one, POST create, PUT update)
- Documents the data store contract (listResource, getResource, createResource, updateResource)
- Includes full example for creating a comments route
- Covers validation rules, status codes, and error formats
- Points out when NOT to use this skill (modifying existing routes, non-resource endpoints)

**Testing:**
```bash
# In Claude Code, try:
# "Create a new posts route with GET, POST, and PUT endpoints"
# Claude should reference the skill and generate code matching the pattern
```

---

### 2. Command: Quick Route Generation (`commands/create-route.md`)

**Purpose:** Provide a fast slash command to scaffold a complete new route in seconds.

**Usage:**
```
/create-route <resource-name>
```

**Example:**
```
/create-route comments
```

**What it generates:**
- `routes/comments.js` with CRUD endpoints
- Data store helpers in `db/store.js` (listComments, getComment, createComment, updateComment)
- Mount in `server.js` under `/comments`

**Testing:**
```bash
# Try running in Claude Code:
/create-route posts

# Then verify the generated files exist and follow the pattern:
cat routes/posts.js
grep -A5 "createPost\|listPosts" db/store.js
grep "use.*posts" server.js
```

---

### 3. Hook: Pre-commit Linting (`settings.json`)

**Purpose:** Automatically lint code before each commit to catch style issues early.

**Configuration:**
```json
{
  "hooks": [
    {
      "event": "before-commit",
      "action": "command",
      "description": "Lint code before committing",
      "command": "npm run lint"
    }
  ]
}
```

**What it does:**
- Runs `npm run lint` before every git commit
- Blocks the commit if linting fails
- Ensures all committed code passes ESLint

**Testing:**
```bash
# Make a change that violates ESLint rules:
echo "const x=1" >> server.js

# Try to commit (should be blocked by the hook):
git add -A
git commit -m "test"

# Should see ESLint errors. The commit is prevented.
# Fix the linting error:
# npm run lint --fix

# Now the commit should succeed
```

---

### 4. MCP Server: Project Understanding (`mcp_server.py` + `.mcp.json`)

**Purpose:** Provide Claude with tools to read and understand the Course API codebase.

**Configuration (`.mcp.json`):**
```json
{
  "mcpServers": {
    "course-api": {
      "command": "python3",
      "args": ["mcp_server.py"],
      "description": "MCP server for Course API project"
    }
  }
}
```

**Available Tools:**
- `read_route <resource>` — Read the code of an existing route file (e.g., "users", "comments")
- `read_store` — Read db/store.js to see all available data helpers
- `read_server` — Read server.js to see how routes are mounted
- `list_routes` — List all existing routes in the project
- `read_api_docs` — Read the API documentation

**What it enables:**
- Claude can examine existing routes before scaffolding new ones
- Claude understands the project structure and data store contract
- Supports intelligent suggestions based on actual codebase state

**Testing:**
```bash
# Start the MCP server:
python3 mcp_server.py
# Should see: "🚀 Course API MCP server running on http://localhost:3002/sse"

# In a separate terminal, test a tool (using curl):
curl -X POST http://localhost:3002/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_routes",
      "arguments": {}
    }
  }'

# Or, in Claude Code:
# Claude will automatically use these tools when it needs to understand the codebase
```

---

## Full Integration Workflow

When you ask Claude to create a new route in Claude Code:

1. **Skill** activates and reminds Claude of the routing patterns
2. **MCP Server** tools are available to read existing routes and understand the structure
3. **Command** `/create-route <name>` can be invoked for quick scaffolding
4. **Hook** automatically lints the generated code before you commit

**Example workflow:**
```bash
# 1. Ask Claude to create a new route
# "Create a new 'products' route with GET, POST, PUT endpoints"

# 2. Claude uses the skill to understand patterns
# 3. Claude uses MCP tools to see existing routes (optional)
# 4. Claude generates the code
# 5. You review and commit:
git add -A
git commit -m "Add products route"

# 6. The hook runs npm run lint before committing
# 7. If linting passes, commit succeeds
```

---

## Troubleshooting

### Skill not triggering
- Make sure `.claude/skills/route-scaffold/SKILL.md` exists
- The skill triggers on keywords: "create a route", "new endpoint", "scaffold", etc.

### Command not working
- Verify `.claude/commands/create-route.md` exists
- Type `/create-route <name>` exactly as shown
- Check that the project has `routes/`, `db/`, and `server.js`

### Hook not running
- Verify `.claude/settings.json` exists with the hooks configuration
- Check that `npm run lint` works: `npm run lint` from command line
- Ensure you're committing files with `git commit` (not `git commit --no-verify`)

### MCP Server connection issues
- Start the server: `python3 mcp_server.py`
- Verify it's running on `localhost:3002`
- Check `.mcp.json` references `mcp_server.py` in the args

---

## File Locations Summary

```
.claude/
├── NOTES.md                    # This file
├── settings.json               # Hook configuration (integration 3)
├── commands/
│   └── create-route.md         # Route scaffolding command (integration 2)
└── skills/
    └── route-scaffold/
        └── SKILL.md            # Route patterns skill (integration 1)

mcp_server.py                   # MCP server for project tools (integration 4)
.mcp.json                       # MCP server configuration (integration 4)
```

---

## Next Steps

1. **Test the skill**: Ask Claude to create a new route and verify it follows the patterns
2. **Test the command**: Run `/create-route <name>` and check the generated files
3. **Test the hook**: Make a linting violation and try to commit (should fail)
4. **Test the MCP server**: Ask Claude to read existing routes and understand the structure

Once all tests pass, the integration is complete and ready for daily use.

# Project Setup Notes

## 1. MCP Servers Connected

### **Bash MCP Server** & **Git MCP Server**
- **Which:** `@modelcontextprotocol/server-bash` + `@modelcontextprotocol/server-git`
- **Why useful here:** 
  - Bash: Run npm commands (test, lint, dev) without manual intervention
  - Git: Handle version control (branches, commits, history)
- **Permission rule allowed:**
  ```json
  "mcp:bash": {
    "allow": ["read", "write"],
    "deny": ["delete"]
  }
  ```
  - ✅ Read files/directories
  - ✅ Write/modify files
  - ❌ Delete files (safety lock)

---

## 2. Skill for Repeated Work

### **Skill: `verify`** (`.claude/skills/verify.md`)
- **What it captures:** The repeated pattern of running `npm run lint` + `npm run test` before committing
- **How I worded it to fire:** 
  - Name: "verify"
  - Description: "Run linting and tests to verify code quality before committing"
  - Keywords like "verify", "lint", "test", "quality check" trigger its relevance
  - Fires when you want code quality assurance before commits

---

## 3. Commands Added as Shortcuts

### **Shell Commands in `.claude/commands/`**
- **What:** Created `dev.sh` and `test.sh` shortcuts
- **Why worth it:** 
  - `dev.sh` → `npm run dev` (frequent: start API locally)
  - `test.sh` → `npm run test` (frequent: validate code)
  - Shortens common workflows into single commands
  - Reduces context switching

---

## 4. Hook Configuration

### **Main Branch Protection Hook**
- **Event:** `PreToolUse` (fires BEFORE bash command executes)
- **Type:** **PREVENT** (blocks execution)
- **Trigger:** Detects `git push` commands targeting main
- **Action:** 
  ```
  Blocks: git push origin main, git push main, git push HEAD:main
  Message: "Cannot push directly to main. Create feature branch & PR instead."
  ```
- **Result:** Forces workflow through pull requests instead of direct pushes

---

## 5. Headless Execution & Lockdown

### **What ran headless:**
- `npm test` — Full test suite execution in terminal (no UI, 5 tests passed)
- `npm install` — Installed dependencies silently
- Both run without interaction, pure CLI output

### **What locked down:**
- **Bash delete permission:** Denied to prevent accidental file removal
- **Main branch push:** Blocked by PreToolUse hook to enforce PR workflow
- **Project scope config:** MCP servers stored in `.mcp.json` (shared with team)
- **Permission rules:** Defined in `.claude/settings.json` for security

---

## Project Status
- ✅ MCP servers connected (Bash + Git)
- ✅ Permissions configured (read/write, no delete)
- ✅ Skill created for code quality verification
- ✅ Shortcuts added for dev/test commands
- ✅ Hook deployed to protect main branch
- ✅ Dependencies installed
- ✅ All 5 tests passing
- ✅ Ready for development

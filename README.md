## Wire Claude into your stack
 
This is the third project of the course. You'll take everything from Units 5, 6, and 7 and wire Claude into the project itself: connect a server it can use, teach it a skill, give it a command, and set a hook that holds a standard — the way you'd set a project up so everyone's Claude works the same.
 
This builds on the same repository from the first two projects. Each level's project adds to it, all the way to a shareable plugin at the end — and the wiring you commit here is what that plugin will eventually bundle.
 
### The repository
 
You'll work on the course repo — the small Express API you set up in the first project and shipped a change to in the second. The platform connects the repo for you; you'll do your work on a branch and submit that branch for review. This time you're not changing what the app does — you're setting up *how Claude works on it*. Everything you add lives in the repo and gets committed, so it travels to every teammate who clones it.
 
### What you'll wire in
 
Four integrations, one for each tool you met in this level:
 
- **A server (MCP)** — something useful Claude can reach on this project, connected so the whole team gets it.
- **A skill** — a way of working this project repeats, written down once so Claude applies it on its own.
- **A command** — a prompt you run often, saved behind a `/name`.
- **A hook** — a standard that has to hold every time, enforced automatically.
The point isn't four clever tricks. It's a repo where Claude is set up the way the project needs, ready to hand to the next person.
 
### What you'll deliver
 
On your branch of the repo:
 
- a committed `.mcp.json` — a server at project scope, with a permission rule scoping what it may do
- a project skill in `.claude/skills/<name>/SKILL.md` that fires on the right request
- a custom command in `.claude/commands/<name>.md`
- a hook in `.claude/settings.json`
- one task run headless with a scoped `--allowedTools`
- a short `NOTES.md` explaining your choices
## Before you start
 
1. Finish Units 5, 6, and 7.
2. Have Claude Code installed and signed in (`claude --version`), and `gh auth login` done so Claude can open the pull request.
3. Get the repo onto your machine (clone it, or open it from the platform) and open a terminal in the project folder.

### Tasks
 
#### 1. Connect a server the project can use
 
Pick a server that genuinely helps work on *this* repo — a fetch server for pulling in API references, a filesystem server pointed at a docs folder, or another from Unit 5. Prefer a credential-free one, but feel free to make your own research with Claude. Connect it at **project scope** so it lands in a committed `.mcp.json`. Then set one permission rule that scopes what it may do — allow the read-only tools you'll actually use, rather than blanket-allowing the server. Finish by using it once on a real task, so you've seen it work, not just connected it.
 
If the server you choose needs a key, keep the secret out of `.mcp.json` — reference it as `${VAR}` and set the variable in your environment.
 
#### 2. Teach the project a skill
 
Find a way of working this project repeats — how a route is written, how tests are structured here, the project's error-response format — and encode it as a project skill in `.claude/skills/`. Again, you can research the project flow with Claude to make your work more efficient. Write the description specific enough that it fires on the right request and nothing else. Commit it, then ask Claude to do that kind of task *without naming the skill*, and confirm it triggers. If it doesn't, tighten the description until it does.
 
#### 3. Add a command you'll reuse
 
Take a prompt you'd run often on this repo — a review against the project's checklist, a "summarise what changed," a scaffold for a new route — and save it as a custom command in `.claude/commands/`. If it needs input, wire in `$ARGUMENTS` (one free-form value) or `$1`/`$2` (separate fields). Run it once to confirm it does what you meant, and adjust the saved prompt if it doesn't.
 
#### 4. Set a hook that holds a standard
 
Add one hook that should always happen on this project — auto-format after edits, or a guard that blocks a risky command — at **project scope**, so it's committed in `.claude/settings.json`. Decide the three choices deliberately: the event (react with PostToolUse, or prevent with PreToolUse), the matcher (which tool it watches), and the command. Then trigger the situation on purpose and watch the hook fire.
 
#### 5. Run one task without... you
 
Pick a single, well-scoped task and run it headless with `claude -p`, pre-approving only the tools it needs with a tight `--allowedTools` set. Note what you allowed and why — this is the same wiring, now safe to run with nobody watching.
 
#### 6. Write your NOTES.md
 
In a short `NOTES.md`, answer in a few sentences each:
 
- Which server did you connect, why is it useful here, and what did your permission rule allow?
- What repeated way of working did your skill capture, and how did you word the description so it fires?
- What command did you add, and what makes it worth a shortcut?
- What hook did you set — does it react or prevent, and on which event?
- What did you run headless, and what did you lock down?

### Definition of done
 
- [X] a server is connected at project scope (committed `.mcp.json`), with a permission rule scoping what it may do, and you've used it at least once
- [X] a project skill exists in `.claude/skills/`, with a description that triggers on the right request, and you confirmed it fires
- [X] a custom command exists in `.claude/commands/` and runs the way you intended
- [X] a hook is set at project scope (committed `.claude/settings.json`) and fires on its event
- [X] one task run headless with a scoped `--allowedTools`
- [X] `NOTES.md` committed, explaining each choice

### Submit
 
1. Your work is on a branch. Confirm with `git status`.
2. Make sure everything is pushed — ask Claude to push, or:
```
   git push -u origin <your-branch>
```
3. Open a pull request against the main repository, not your fork, and submit it through the platform, which copies your branch for review.
Before you submit, make sure that:
 
- [X] only the intended files are in the PR — the `.mcp.json`, the `.claude/` files, and `NOTES.md` — with no secrets committed
- [X] the skill fires, the command runs, and the hook triggers on a fresh checkout
- [X] `NOTES.md` explains each choice
---
 
**How this is checked:** a reviewer clones your branch and checks that Claude comes wired — the server connects, the skill fires on the right request, the command runs, the hook holds — and reads `NOTES.md` for your reasoning.

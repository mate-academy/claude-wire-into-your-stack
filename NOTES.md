
## Server

I connected the filesystem server, is useful because has a scoped path where the server can only read docs/ folder

The permissions applied are read only 

## Skill
The skill captures how to add a route (add-route) with help from Claude planning mode I created this skill describing how routes are written (with the data access file, parameters converted to ids and validation of real routes, returned responses and errors)
Also verifying with tests, running lints and updated the api.md file with the latest route.


## Command
Command: review-commit is being added because is going to verify each change against the convention and structure already defined, I tried to add a delete user end point and when /review-commit was executed, found some problems, for instance it doesn't have an id validation, this command also found that there was not test if there was any user left.

## Hook

PreToolUse: prevents push with force to github
PostToolUse : runs lint 

## Run headless 

I ran  claude -p 'run lint and list if any failure' --allowedTools "Bash(npm run lint)" --max-turns 5 with no error existing

I allowed only the `Bash(npm run lint)` command, so the run could execute lint and nothing else (no file edits, no other shell commands), and capped it at 5 turns. Nobody is there to approve prompts in a headless run, so the tool list is what keeps it safe.


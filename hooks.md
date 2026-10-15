

A hook is saved into a settings file, and which file you save it to decides who gets it - the same scope call you made for skills and commands.
Two homes:
~/.claude/settings.json - personal. Your hooks, active in every project you open, seen by nobody else.
.claude/settings.json - in the project. Commit it, and every teammate who pulls the repo gets the hook automatically, with no setup on their side
/hooks → PreToolUse → matcher: Bash → command: ./.claude/hooks/block-publish.sh

claude -p "list the files here, then delete the README" --allowedTools "Read"

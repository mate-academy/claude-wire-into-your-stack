#!/usr/bin/env python
"""PreToolUse hook: blocks shell commands that delete files.

Reads the hook's stdin JSON payload itself (no jq dependency -- not installed
in this environment). Applies to the Bash and PowerShell tools, since Claude
Code has no dedicated file-delete tool -- deletion only happens via shell
commands. Fails open (allows the tool call) if the payload can't be parsed,
so a broken environment doesn't lock the tools out entirely.
"""

import json
import re
import sys

# Matches a deletion command at the start of the string or after a shell
# separator (;, &&, ||, |), case-insensitively, so e.g. "npm rm" or a path
# component named "rm-notes" isn't caught, but "rm file.txt" or
# "cd foo && Remove-Item bar" is.
DELETE_PATTERN = re.compile(
    r"(^|[;&|]\s*)" r"(rm|rmdir|rd|del|erase|rimraf|git\s+rm|Remove-Item)\b",
    re.IGNORECASE,
)


def main():
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        return 0

    command = (payload.get("tool_input") or {}).get("command") or ""
    if not isinstance(command, str) or not DELETE_PATTERN.search(command):
        return 0

    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": (
                        "File deletion commands are blocked in this project. "
                        "Ask the user to delete the file themselves if it's needed."
                    ),
                }
            }
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())

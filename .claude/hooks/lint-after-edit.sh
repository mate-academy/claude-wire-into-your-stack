#!/bin/sh
# PostToolUse hook: run lint after every Edit/Write, surface errors to Claude.

npm run lint
status=$?

if [ $status -ne 0 ]; then
  echo "Lint fail after edit. Fix before continue." >&2
  exit 2
fi

exit 0

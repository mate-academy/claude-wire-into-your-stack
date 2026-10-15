---
description: Count the data rows in a CSV file (header row excluded)
argument-hint: <file.csv>
---

Run `node scripts/count-rows.js $ARGUMENTS` and report the resulting row count to the user as a single line, e.g. "`$ARGUMENTS` has N rows (header excluded)." If the script errors (missing file, unreadable path), report that error message directly instead of guessing a count.

argument-hint: "[file-path]"

Target file: $ARGUMENTS

Check the "Target file" value above:
- **If a file path is provided:** Find every TODO and FIXME comment in the "Target file".
- **If "Target file" is empty:** Find every TODO and FIXME comment in the codebase and list them grouped by file.

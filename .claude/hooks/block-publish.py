#!/usr/bin/env python3
"""Course guard: inspect hook input without executing the proposed command."""
import json
import re
import sys

payload = json.load(sys.stdin)
command = payload.get("tool_input", {}).get("command", "")
if re.search(r"\bnpm\s+publish\b", command):
    print("Publishing requires a deliberate human action.", file=sys.stderr)
    sys.exit(2)

---
name: open_docs_folder
description: Use the filesystem MCP server to list the project's docs folder, sorted by last-modified date, descending
---
# open_docs_folder
1. **What happens** --- use the `mcp__filesystem__*` tools (e.g. `list_directory` and `get_file_info`) to read the project's `docs/` folder and list every document, newest modified first
2. **Why** --- to list all project documents and indicate which was added or modified most recently
3. **How to test** --- the docs folder and its list of documents should be in descending order by last-modified date


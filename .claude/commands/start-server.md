# Start the API server

Start the Express API development server locally on port 3000.

Run `npm run dev` in the background so it doesn't block the current session. The server will listen on http://localhost:3000. Report back when the server is running and how to stop it (Ctrl+C or via the Monitor tool).

Ensure `mocks/users.mock.json` is in place before starting — if not, direct the user to run `ROOT_PROJECT=$(pwd) node scripts/start-filesystem-mcp.js` first to set up the MCP server and mock data symlink.

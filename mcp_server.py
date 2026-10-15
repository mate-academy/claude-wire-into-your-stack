#!/usr/bin/env python3
"""
MCP Server for Course API — provides tools to work with the API project.
Allows Claude to read/write routes and understand the project structure.
"""

import asyncio
import json
import os
from pathlib import Path
from typing import Any

from mcp.server import Server
from mcp.server.sse import SSEServerTransport
from mcp.types import Tool, TextContent
from aiohttp import web

# Project root
PROJECT_ROOT = Path(__file__).parent

class CourseAPIServer:
    def __init__(self):
        self.server = Server("course-api-tools")
        self._setup_handlers()

    def _setup_handlers(self):
        """Register request handlers for the server."""

        @self.server.list_tools()
        async def list_tools() -> list[Tool]:
            """List available tools."""
            return [
                Tool(
                    name="read_route",
                    description="Read the code of an existing route file",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "resource": {
                                "type": "string",
                                "description": "Resource name, e.g., 'users', 'comments'"
                            }
                        },
                        "required": ["resource"]
                    }
                ),
                Tool(
                    name="read_store",
                    description="Read the data store file (db/store.js) to see available helpers",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                ),
                Tool(
                    name="read_server",
                    description="Read the server.js file to see how routes are mounted",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                ),
                Tool(
                    name="list_routes",
                    description="List all existing routes in the project",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                ),
                Tool(
                    name="read_api_docs",
                    description="Read the API documentation",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                ),
            ]

        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
            """Execute a tool call."""

            if name == "read_route":
                resource = arguments.get("resource", "").lower()
                route_path = PROJECT_ROOT / "routes" / f"{resource}.js"

                if not route_path.exists():
                    return [TextContent(
                        type="text",
                        text=f"Route file not found: {route_path}",
                        isError=True
                    )]

                try:
                    content = route_path.read_text()
                    return [TextContent(type="text", text=content)]
                except Exception as e:
                    return [TextContent(
                        type="text",
                        text=f"Error reading route: {e}",
                        isError=True
                    )]

            elif name == "read_store":
                store_path = PROJECT_ROOT / "db" / "store.js"
                try:
                    content = store_path.read_text()
                    return [TextContent(type="text", text=content)]
                except Exception as e:
                    return [TextContent(
                        type="text",
                        text=f"Error reading store: {e}",
                        isError=True
                    )]

            elif name == "read_server":
                server_path = PROJECT_ROOT / "server.js"
                try:
                    content = server_path.read_text()
                    return [TextContent(type="text", text=content)]
                except Exception as e:
                    return [TextContent(
                        type="text",
                        text=f"Error reading server: {e}",
                        isError=True
                    )]

            elif name == "list_routes":
                routes_dir = PROJECT_ROOT / "routes"
                try:
                    if not routes_dir.exists():
                        return [TextContent(
                            type="text",
                            text="No routes directory found"
                        )]

                    route_files = sorted([f.stem for f in routes_dir.glob("*.js")])
                    routes_text = "\n".join(f"  - /{f}" for f in route_files)

                    return [TextContent(
                        type="text",
                        text=f"Existing routes:\n{routes_text}"
                    )]
                except Exception as e:
                    return [TextContent(
                        type="text",
                        text=f"Error listing routes: {e}",
                        isError=True
                    )]

            elif name == "read_api_docs":
                docs_path = PROJECT_ROOT / "docs" / "api.md"
                try:
                    if not docs_path.exists():
                        return [TextContent(
                            type="text",
                            text="API documentation not found"
                        )]

                    content = docs_path.read_text()
                    return [TextContent(type="text", text=content)]
                except Exception as e:
                    return [TextContent(
                        type="text",
                        text=f"Error reading docs: {e}",
                        isError=True
                    )]

            else:
                return [TextContent(
                    type="text",
                    text=f"Unknown tool: {name}",
                    isError=True
                )]

    async def handle_sse(self, request: web.Request) -> web.StreamResponse:
        """Handle SSE connections."""
        async with SSEServerTransport(request) as transport:
            await self.server.run(transport)
        return web.Response()


async def main():
    """Start the MCP server."""
    server = CourseAPIServer()

    # Create aiohttp app
    app = web.Application()
    app.router.add_get("/sse", server.handle_sse)

    # Health check endpoint
    async def health(request):
        return web.json_response({"status": "ok", "service": "course-api-mcp"})

    app.router.add_get("/health", health)

    # Start server
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "localhost", 3002)
    await site.start()

    print("🚀 Course API MCP server running on http://localhost:3002/sse")

    try:
        await asyncio.Event().wait()
    except KeyboardInterrupt:
        print("Shutting down...")
        await runner.cleanup()


if __name__ == "__main__":
    asyncio.run(main())

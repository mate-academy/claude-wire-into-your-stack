const fs = require('fs');
const path = require('path');

const projectRoot = process.env.PROJECT_ROOT || process.cwd();

// MCP tools implementation
const tools = {
  read_file: async (filePath) => {
    try {
      const fullPath = path.join(projectRoot, filePath);
      if (!fullPath.startsWith(projectRoot)) {
        return { error: 'Access denied: path outside project root' };
      }
      const content = fs.readFileSync(fullPath, 'utf8');
      return { content };
    } catch (err) {
      return { error: err.message };
    }
  },

  list_routes: async () => {
    try {
      const routesDir = path.join(projectRoot, 'routes');
      const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
      return {
        routes: files.map(f => ({
          file: f,
          path: `/${f.replace('.js', '')}`
        }))
      };
    } catch (err) {
      return { error: err.message };
    }
  }
};

// Simple MCP server over stdio
async function handleRequest(request) {
  const { method, params } = request;

  if (method === 'tools/list') {
    return {
      tools: [
        {
          name: 'read_file',
          description: 'Read a file from the project',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: { type: 'string', description: 'Path to file relative to project root' }
            },
            required: ['filePath']
          }
        },
        {
          name: 'list_routes',
          description: 'List all API routes in the project',
          inputSchema: { type: 'object', properties: {} }
        }
      ]
    };
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params;
    if (tools[name]) {
      return await tools[name](args.filePath || undefined);
    }
    return { error: `Unknown tool: ${name}` };
  }

  return { error: `Unknown method: ${method}` };
}

// Main loop
async function main() {
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin });

  for await (const line of rl) {
    try {
      const request = JSON.parse(line);
      const response = await handleRequest(request);
      console.log(JSON.stringify(response));
    } catch (err) {
      console.log(JSON.stringify({ error: err.message }));
    }
  }
}

main().catch(console.error);

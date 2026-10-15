#!/usr/bin/env node
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');

const server = new McpServer({ name: 'weather', version: '1.0.0' });

server.registerTool(
  'get_weather',
  {
    title: 'Get current weather',
    description: 'Get current weather conditions for a location by latitude/longitude, via the free Open-Meteo API (no API key required).',
    inputSchema: {
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    },
  },
  async ({ latitude, longitude }) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
    const response = await fetch(url);
    if (!response.ok) {
      return {
        content: [{ type: 'text', text: `Open-Meteo request failed: ${response.status} ${response.statusText}` }],
        isError: true,
      };
    }
    const data = await response.json();
    return {
      content: [{ type: 'text', text: JSON.stringify(data.current, null, 2) }],
    };
  }
);

const transport = new StdioServerTransport();
server.connect(transport);

---
name: api-route
description: Use when creating a new API route in routes/ folder, add endpoint, new route, API endpoint
---

# API Route Skill

When creating a new API route in this stack:

1. Create file in routes/ named [name].js
2. Export an express Router
3. Use error format: { error: "message" }
4. Add test in tests/ similar to users.test.js
5. Document endpoint in docs/api.md

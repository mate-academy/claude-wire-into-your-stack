---
name: api-insights
description: Generate dynamic interesting facts and tips about API development when you need to wait or want useful insights. Perfect for getting API-related knowledge while tasks are running.
---

# API Insights Skill

This skill generates dynamic interesting facts and tips about API development, specifically tailored to the course-api project (Express.js REST API). It's useful when you're waiting for tasks to complete or want to learn something new about API development.

## How It Works

The skill dynamically combines facts and tips from various API-related topics to generate unique insights each time it's invoked. Topics include:

- Express.js
- REST APIs
- Node.js
- HTTP Methods
- API Design
- Testing
- Performance
- Security
- Middleware
- Database
- Authentication
- Versioning
- Documentation
- Error Handling
- Rate Limiting

## Usage

### As an Agent Skill

When you give Claude a task and need to wait, this skill can automatically provide interesting API-related facts and tips to keep you informed and engaged.

### Manual Usage

You can also run the skill directly to get an instant insight:

```bash
node .claude/skills/api-insights/driver.mjs
```

Example output:
```
🔍 Dynamic Insight about Security (14:32:15):
💡 Pro tip: Always validate and sanitize user input on the server
Did you know that OWASP API Security Top 10 includes broken object level authentication as #1 risk?
```

## Dynamic Generation

Unlike static fact lists, this skill generates insights by:
1. Selecting a random API topic
2. Choosing a relevant fact from that topic's knowledge base
3. Selecting a practical tip for the same topic
4. Applying random templates to format the output
5. Including a timestamp for context

This ensures you get fresh, relevant insights each time you use the skill.

## Topics Covered

Each topic includes specialized facts and tips:

**Express.js**: Framework features, middleware, routing, best practices
**REST APIs**: Architectural principles, HTTP methods, design patterns
**Node.js**: Runtime environment, ecosystem, performance characteristics
**HTTP Methods**: Semantics, proper usage, idempotency
**API Design**: Versioning, documentation, developer experience
**Testing**: Strategies, frameworks, test types, TDD
**Performance**: Optimization, caching, scaling, monitoring
**Security**: Vulnerabilities, protection methods, best practices
**Middleware**: Function signature, ordering, built-in vs custom
**Database**: Storage options, querying, transactions, ORMs
**Authentication**: Methods, token management, security practices
**Versioning**: Strategies, compatibility, deprecation policies
**Documentation**: Standards, tools, maintenance, developer portals
**Error Handling**: Formats, logging, client-side considerations
**Rate Limiting**: Algorithms, headers, implementation strategies

## Requirements

- Node.js (v14+ recommended)
- No additional dependencies required

## Example Use Cases

- Waiting for tests to complete: Get API insights while `npm test` runs
- Learning about API concepts: Expand your knowledge during development breaks
- Team sharing: Share interesting facts with colleagues during code reviews
- Interview preparation: Refresh your API knowledge before technical interviews

The skill is designed to be lightweight and informative, providing valuable API development insights without interrupting your workflow.
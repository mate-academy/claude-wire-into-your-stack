---
name: api-doc-generator
description: Generate create update API documentation
---

# API Documentation Generator Skill

This skill analyzes your Express.js codebase and generates comprehensive API documentation in Markdown format. It extracts information from route handlers, controller functions, data models, and test files to create accurate documentation that stays in sync with your implementation.

## How It Works

When invoked, this skill will:

1. **Scan route files** (`routes/*.js`) to identify endpoints, HTTP methods, and path parameters
2. **Analyze controller logic** to understand request validation, response formats, and error handling
3. **Examine data models** (in `db/` or similar) to document request/response schemas
4. **Review test files** to understand expected behavior and edge cases
5. **Generate a structured Markdown document** with sections for each resource, including:
   - Endpoint descriptions
   - HTTP methods and paths
   - Request parameters (path, query, body)
   - Request/response examples
   - Status codes and error responses
   - Authentication requirements (if applicable)

## Usage

### As an Agent Skill

When you tell Claude you need to generate API documentation for your Express.js project, this skill will automatically activate and produce a `API_DOCUMENTATION.md` file in your project root.

### Manual Usage

You can also run the skill directly:

```bash
# From your project root
skill api-doc-generator
```

## Output Format

The generated documentation follows this structure:

```markdown
# API Documentation

## Overview
Brief description of the API

## Authentication
(If applicable)

## Resources

### [Resource Name] (`/path/to/resource`)

#### GET `/path/to/resource`
- Description: What this endpoint does
- Parameters:
  - Path: `id` (number) - Description
  - Query: `limit` (number, optional) - Description
- Request Body: None
- Responses:
  - 200 OK: Description of successful response
    ```json
    [
      { "id": 1, "name": "Example", "email": "example@test.com" }
    ]
    ```
  - 400 Bad Request: Validation errors
  - 404 Not Found: Resource not found
  - 500 Internal Server Error: Server error

#### POST `/path/to/resource`
- Description: What this endpoint does
- Parameters:
  - Path: None
  - Query: None
- Request Body:
  ```json
  {
    "name": "string (required)",
    "email": "string (required)"
  }
  ```
- Responses:
  - 201 Created: Resource created successfully
    ```json
    { "id": 3, "name": "Grace Hopper", "email": "grace@example.com" }
    ```
  - 400 Bad Request: Missing or invalid fields
  - 409 Conflict: Resource already exists
```

## Implementation Details

The skill examines:

- **Route files**: Looks for `express.Router()` instances and `.get()`, `.post()`, `.put()`, `.delete()` calls
- **Handler functions**: Extracts validation logic, status codes, and response formatting
- **Data store**: Examines model definitions to understand data shapes
- **Test files**: Reviews test cases to confirm expected behavior and error conditions

## Requirements

- Node.js (v12+ recommended)
- Express.js application structure
- Standard route organization (routes in `routes/` directory)

## Example Use Cases

- **Starting a new project**: Generate initial API documentation as you build endpoints
- **Documenting existing code**: Create documentation for an undocumented API
- **Keeping docs updated**: Regenerate documentation after making API changes
- **Onboarding new team members**: Provide comprehensive API reference
- **Preparing for releases**: Ensure documentation matches implemented features

## Customization

You can customize the documentation generation by:
- Modifying the skill's analysis logic in the driver script
- Adding custom templates for different documentation styles
- Including project-specific sections (like authentication schemes)
- Adjusting the level of detail in the generated output
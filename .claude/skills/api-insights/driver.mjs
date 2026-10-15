#!/usr/bin/env node

// Driver script for dynamically generating interesting facts and tips about API development
// Related to the course-api project (Express.js REST API)

const topics = [
  "Express.js",
  "REST APIs",
  "Node.js",
  "HTTP Methods",
  "API Design",
  "Testing",
  "Performance",
  "Security",
  "Middleware",
  "Database",
  "Authentication",
  "Versioning",
  "Documentation",
  "Error Handling",
  "Rate Limiting"
];

const factTemplates = [
  "Did you know that {fact}?",
  "Here's an interesting fact: {fact}",
  "Fun fact: {fact}",
  "Interesting to note: {fact}",
  "You might find this fascinating: {fact}",
  "A lesser-known fact: {fact}",
  "It's worth remembering that {fact}",
  "Consider this: {fact}",
  "As a point of interest: {fact}",
  "For your knowledge: {fact}"
];

const tipTemplates = [
  "💡 Pro tip: {tip}",
  "💡 Remember: {tip}",
  "💡 Best practice: {tip}",
  "💡 Try this: {tip}",
  "💡 Expert advice: {tip}",
  "💡 Quick tip: {tip}",
  "💡 Keep in mind: {tip}",
  "💡 Word to the wise: {tip}",
  "💡 Helpful hint: {tip}",
  "💡 Developer advice: {tip}"
];

const expressFacts = [
  "Express.js was created by TJ Holowaychuk in 2010",
  "Express.js is the most popular Node.js web framework",
  "Express.js is inspired by Sinatra, a Ruby web framework",
  "Express.js provides a thin layer of fundamental web application features",
  "Express.js is minimal and flexible, providing robust features for web applications",
  "Express.js was initially released as open source under the MIT License",
  "Express.js has over 60,000 stars on GitHub",
  "Express.js is downloaded over 10 million times per week from npm"
];

const restFacts = [
  "REST was defined by Roy Fielding in his 2000 doctoral dissertation",
  "REST stands for Representational State Transfer",
  "REST is an architectural style, not a protocol or standard",
  "RESTful systems use stateless communication",
  "REST leverages standard HTTP methods (GET, POST, PUT, DELETE, etc.)",
  "REST emphasizes resources identified by URIs",
  "REST promotes a uniform interface for interactions",
  "REST can use various data formats (JSON, XML, etc.), with JSON being most common"
];

const nodeFacts = [
  "Node.js uses Google's V8 JavaScript engine",
  "Node.js was created by Ryan Dahl in 2009",
  "Node.js uses an event-driven, non-blocking I/O model",
  "Node.js is single-threaded but can handle concurrent operations",
  "Node.js has a vast ecosystem of packages through npm",
  "Node.js is used by companies like Netflix, Uber, and PayPal",
  "Node.js enables JavaScript to be used for server-side scripting",
  "Node.js follows the 'JavaScript everywhere' paradigm"
];

const httpMethodFacts = [
  "The PATCH method was introduced in RFC 5789 (2010) for partial updates",
  "HTTP methods are also known as 'verbs'",
  "HEAD is like GET but without the response body",
  "OPTIONS describes communication options for a resource",
  "TRACE is used for diagnostic purposes",
  "CONNECT establishes a tunnel to the server",
  "There are 9 official HTTP methods in HTTP/1.1",
  "Custom HTTP methods can be defined but are not standardized"
];

const apiDesignFacts = [
  "GitHub's API processes over 1 billion requests per day",
  "Twitter's API handles over 150 billion requests daily",
  "Stripe's API is known for its excellent documentation and consistency",
  "API-first design is becoming a standard approach in microservices",
  "GraphQL was developed by Facebook in 2012 and open-sourced in 2015",
  "APIs are often considered products in modern software architecture",
  "Good API design focuses on developer experience (DX)",
  "Versioning is crucial for maintaining backward compatibility in APIs"
];

const testingFacts = [
  "The average developer spends about 20% of their time debugging code",
  "Automated tests can catch up to 90% of defects before production",
  "Test-Driven Development (TDD) follows the Red-Green-Refactor cycle",
  "Code coverage metrics don't guarantee absence of bugs",
  "Integration tests verify that different modules work together",
  "End-to-end tests simulate real user scenarios",
  "Mocking allows testing components in isolation",
  "Property-based testing generates test cases automatically"
];

const performanceFacts = [
  "A 1-second delay in API response can reduce conversions by 7%",
  "53% of mobile site visitors leave if loading takes longer than 3 seconds",
  "Google found that page load time impacts search rankings",
  "Caching can reduce database load by up to 90% for read-heavy applications",
  "CDNs can improve API latency by serving content from edge locations",
  "Database indexing can improve query performance by 100x or more",
  "Async/await improves readability without sacrificing performance",
  "Connection pooling reduces overhead of establishing database connections"
];

const securityFacts = [
  "OWASP API Security Top 10 includes broken object level authentication as #1 risk",
  "Injection attacks remain one of the most critical API vulnerabilities",
  "Sensitive data exposure was moved to #3 in OWASP Top 10 2021",
  "Security misconfigurations are common in cloud deployments",
  "Using components with known vulnerabilities is a significant risk",
  "Insufficient logging and monitoring hinders breach detection",
  "HTTPS encrypts data in transit using TLS/SSL",
  "Rate limiting helps prevent abuse and denial-of-service attacks"
];

const middlewareFacts = [
  "Express.js middleware functions have access to req, res, and next",
  "Middleware can execute code, modify req/res, end the cycle, or call next",
  "Error-handling middleware has four parameters: (err, req, res, next)",
  "Middleware order matters - they are executed sequentially",
  "Third-party middleware like helmet.js helps secure Express apps",
  "body-parser middleware was merged into Express core in v4.16.0",
  "CORS middleware handles Cross-Origin Resource Sharing",
  "Morgan is a popular HTTP request logger middleware for Node.js"
];

const databaseFacts = [
  "Redis can perform ~100,000 operations per second with sub-millisecond latency",
  "MongoDB is a document-oriented NoSQL database",
  "PostgreSQL is known for its reliability and feature robustness",
  "SQLite is a self-contained, serverless, zero-configuration database",
  "Database normalization reduces data redundancy and improves integrity",
  "ACID properties ensure reliable database transactions",
  "ORMs (Object-Relational Mappers) map database tables to objects",
  "Connection pooling improves database access performance"
];

const authFacts = [
  "JWT (JSON Web Tokens) are compact, URL-safe tokens for claims",
  "OAuth 2.0 is an authorization framework, not an authentication protocol",
  "API keys are simple but less secure than token-based authentication",
  "Basic Auth sends credentials in base64 encoding (not secure over HTTP)",
  "Session-based authentication stores state on the server",
  "Token-based authentication is stateless and scalable",
  "Multi-factor authentication (MFA) adds extra security layers",
  "Passwords should be hashed using bcrypt, scrypt, or Argon2"
];

const versioningFacts = [
  "API versioning helps maintain backward compatibility",
  "Common versioning strategies: URL versioning, header versioning, parameter versioning",
  "Semantic versioning (MAJOR.MINOR.PATCH) is widely adopted for APIs",
  "Deprecation policies should be clearly communicated to API consumers",
  "Sunsetting old API versions requires adequate notice period",
  "Backward incompatible changes should increment the MAJOR version",
  "Feature flags can enable gradual rollout of new functionality",
  "API consumers should specify which version they want to use"
];

const docFacts = [
  "Good API documentation reduces support requests and increases adoption",
  "OpenAPI/Swagger is the most popular standard for API documentation",
  "Interactive API explorers like Swagger UI improve developer experience",
  "Documentation should include examples, error codes, and rate limits",
  "API docs should be treated as first-class citizens in development",
  "Generated documentation stays in sync with implementation",
  "API documentation should be versioned alongside the API itself",
  "Developer portals often include SDKs, code samples, and community forums"
];

const errorHandlingFacts = [
  "Proper error handling improves API reliability and debugging",
  "HTTP status codes in the 4xx range indicate client errors",
  "HTTP status codes in the 5xx range indicate server errors",
  "Always log errors appropriately for production debugging",
  "Don't expose stack traces or internal details in error responses",
  "Validation errors should specify which fields failed validation",
  "Consistent error response format improves client-side handling",
  "Catch-all error handlers prevent unhandled exceptions from crashing servers"
];

const rateLimitFacts = [
  "Rate limiting protects APIs from abuse and ensures fair usage",
  "Common algorithms: Fixed Window, Sliding Window, Token Bucket, Leaky Bucket",
  "Rate limits are often expressed as requests per time unit (e.g., 100/hour)",
  "HTTP 429 (Too Many Requests) is the standard rate limit exceeded response",
  "Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining) inform clients",
  "Distributed rate limiting requires coordination across multiple servers",
  "Rate limiting can be implemented at API gateway, application, or infrastructure level",
  "Graduated rate limits apply different limits based on user tier or behavior"
];

// Map topics to their facts arrays
const topicFactsMap = {
  "Express.js": expressFacts,
  "REST APIs": restFacts,
  "Node.js": nodeFacts,
  "HTTP Methods": httpMethodFacts,
  "API Design": apiDesignFacts,
  "Testing": testingFacts,
  "Performance": performanceFacts,
  "Security": securityFacts,
  "Middleware": middlewareFacts,
  "Database": databaseFacts,
  "Authentication": authFacts,
  "Versioning": versioningFacts,
  "Documentation": docFacts,
  "Error Handling": errorHandlingFacts,
  "Rate Limiting": rateLimitFacts
};

// Default fallbacks
const defaultTips = [
  "Write clean, readable code that follows established conventions",
  "Always test your code thoroughly before deployment",
  "Keep learning and stay updated with industry best practices",
  "Collaborate effectively with your team members",
  "Document your code and decisions for future reference",
  "Seek feedback and be open to constructive criticism",
  "Break down complex problems into smaller, manageable tasks",
  "Celebrate your successes and learn from your mistakes"
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getFactForTopic(topic) {
  const facts = topicFactsMap[topic] || [];
  return facts.length > 0 ? getRandomElement(facts) : getRandomElement([
    `This is a dynamic fact about ${topic} generated at ${new Date().toLocaleTimeString()}`,
    `${topic} is an important concept in modern API development`,
    `Understanding ${topic} helps build better RESTful services`,
    `Best practices for ${topic} evolve with technology and experience`
  ]);
}

function getTipForTopic(topic) {
  // Topic-specific tips
  const topicSpecificTips = {
    "Express.js": [
      "Use express.Router() to modularize your routes",
      "Always handle asynchronous errors properly",
      "Use middleware for cross-cutting concerns like logging",
      "Serve static files with express.static() middleware",
      "Enable trust proxy when behind a load balancer",
      "Use app.use() to mount middleware at specific paths",
      "Handle CORS properly for frontend-backend communication",
      "Use helmet.js to secure Express apps with various HTTP headers"
    ],
    "REST APIs": [
      "Use proper HTTP status codes for different scenarios",
      "Design resource-oriented URLs (nouns, not verbs)",
      "Implement HATEOAS for discoverability when beneficial",
      "Use HTTP methods according to their semantics",
      "Return meaningful error messages in response body",
      "Support content negotiation for different formats",
      "Implement conditional requests with ETags and Last-Modified",
      "Document your API thoroughly with examples"
    ],
    "Node.js": [
      "Always handle asynchronous errors with try/catch or .catch()",
      "Use process.env for configuration instead of hardcoding",
      "Implement graceful shutdown handling for SIGTERM/SIGINT",
      "Use clustering to utilize multiple CPU cores",
      "Monitor memory usage to prevent memory leaks",
      "Use worker threads for CPU-intensive operations",
      "Leverage streams for efficient data processing",
      "Use environment-specific configuration files"
    ],
    "HTTP Methods": [
      "Use GET for retrieving resources (should be safe and idempotent)",
      "Use POST for creating new resources",
      "Use PUT for complete resource replacement (idempotent)",
      "Use PATCH for partial resource updates",
      "Use DELETE for removing resources",
      "Use HEAD to check resource existence without retrieving body",
      "Use OPTIONS to discover supported methods for a resource",
      "Use TRACE sparingly and only for diagnostic purposes"
    ],
    "API Design": [
      "Version your API using URL versioning (/api/v1/) or headers",
      "Use plural nouns for resource collections (/users, not /user)",
      "Use HTTP status codes correctly (201 for created, 204 for no content)",
      "Implement proper authentication and authorization",
      "Provide comprehensive API documentation with examples",
      "Use consistent naming conventions (snake_case or camelCase)",
      "Implement filtering, sorting, and pagination for collections",
      "Consider webhooks for real-time notifications instead of polling"
    ],
    "Testing": [
      "Write tests before implementation (TDD) to clarify requirements",
      "Test both positive and negative cases",
      "Use mocks to isolate units under test",
      "Aim for meaningful test coverage, not just high percentages",
      "Test error conditions and edge cases",
      "Keep tests independent and repeatable",
      "Use descriptive test names that explain the scenario",
      "Run tests automatically on every commit with CI/CD"
    ],
    "Performance": [
      "Use pagination for large datasets to limit response size",
      "Implement caching strategies (Redis, in-memory, HTTP caching)",
      "Use database indexing on frequently queried fields",
      "Enable gzip compression for API responses",
      "Use connection pooling for database connections",
      "Optimize database queries and use explain plans",
      "Implement request/response logging for monitoring",
      "Use CDNs for serving static assets globally"
    ],
    "Security": [
      "Always validate and sanitize user input on the server",
      "Use HTTPS in production to encrypt data in transit",
      "Implement proper authentication and authorization checks",
      "Use environment variables for secrets, never hardcode",
      "Keep dependencies updated to avoid known vulnerabilities",
      "Implement rate limiting to prevent abuse",
      "Use security headers like Helmet.js for Express.js",
      "Log security-relevant events for monitoring and auditing"
    ],
    "Middleware": [
      "Order middleware carefully - earlier middleware runs first",
      "Place error-handling middleware last (with 4 parameters)",
      "Use third-party middleware for common functions (helmet, cors, etc.)",
      "Create custom middleware for application-specific logic",
      "Ensure middleware either ends the cycle or calls next()",
      "Use async/await in middleware for asynchronous operations",
      "Handle errors in middleware by passing them to next(err)",
      "Keep middleware focused on a single responsibility"
    ],
    "Database": [
      "Use connection pooling to reduce database connection overhead",
      "Implement proper indexing on query fields",
      "Use parameterized queries to prevent SQL injection",
      "Consider read replicas for scaling read-heavy workloads",
      "Implement proper backup and disaster recovery strategies",
      "Use transactions for data consistency when needed",
      "Monitor database performance and slow queries",
      "Choose the right database type for your data model"
    ],
    "Authentication": [
      "Use strong, adaptive hashing algorithms (bcrypt, scrypt, Argon2)",
      "Implement multi-factor authentication for sensitive operations",
      "Use short-lived access tokens with refresh token rotation",
      "Store passwords securely - never in plain text or reversible encryption",
      "Implement account lockout after failed login attempts",
      "Use secure cookies with HttpOnly and Secure flags",
      "Implement proper session invalidation on logout",
      "Consider using established auth libraries (Passport.js, Auth0)"
    ],
    "Versioning": [
      "Communicate version changes well in advance to consumers",
      "Use semantic versioning: MAJOR for breaking changes, MINOR for features",
      "Deprecate versions gradually with clear sunset dates",
      "Maintain backward compatibility within major versions when possible",
      "Provide migration guides for version upgrades",
      "Consider using API gateways for version management",
      "Monitor usage of different API versions",
      "Allow consumers to specify preferred version via headers"
    ],
    "Documentation": [
      "Keep documentation close to the code (inline comments, JSDoc)",
      "Use tools like Swagger/OpenAPI to generate interactive docs",
      "Include code examples in multiple languages when possible",
      "Document authentication requirements and error responses",
      "Update documentation as part of the definition of done",
      "Test your documentation by having others implement from it",
      "Include troubleshooting sections and common issues",
      "Make documentation searchable and well-organized"
    ],
    "Error Handling": [
      "Use consistent error response format across all endpoints",
      "Log errors with sufficient context for debugging",
      "Don't leak internal implementation details in error messages",
      "Handle validation errors separately from system errors",
      "Provide correlation IDs for tracing requests across services",
      "Implement circuit breaker pattern for external dependencies",
      "Use centralized error handling to avoid duplication",
      "Test error conditions thoroughly in your test suite"
    ],
    "Rate Limiting": [
      "Choose rate limiting algorithm based on your use case",
      "Implement rate limiting at the appropriate layer (gateway, app, etc.)",
      "Return informative rate limit headers in responses",
      "Exempt internal services or trusted partners when appropriate",
      "Use distributed caching (Redis) for rate limiting across instances",
      "Consider burst allowances for temporary traffic spikes",
      "Monitor rate limiting effectiveness and adjust as needed",
      "Provide clear documentation about your rate limiting policy"
    ]
  };

  const tips = topicSpecificTips[topic] || defaultTips;
  return getRandomElement(tips);
}

function generateDynamicFact() {
  // Select a random topic
  const topic = getRandomElement(topics);

  // Get a fact and tip for that topic
  const fact = getFactForTopic(topic);
  const tip = getTipForTopic(topic);

  // Select random templates
  const factTemplate = getRandomElement(factTemplates);
  const tipTemplate = getRandomElement(tipTemplates);

  // Format the output
  const formattedFact = factTemplate.replace("{fact}", fact);
  const formattedTip = tipTemplate.replace("{tip}", tip);

  return {
    topic,
    fact: formattedFact,
    tip: formattedTip,
    timestamp: new Date().toISOString()
  };
}

function outputFact() {
  const { topic, fact, tip, timestamp } = generateDynamicFact();

  console.log(`\n🔍 Dynamic Insight about ${topic} (${new Date(timestamp).toLocaleTimeString()}):`);
  console.log(fact);
  console.log(tip);
  console.log(); // Extra newline for spacing
}

// If script is run directly, output a fact
if (decodeURIComponent(import.meta.url) === `file://${process.argv[1]}`) {
  outputFact();
}

// Export for use in other scripts (ES module syntax)
export { outputFact, generateDynamicFact };
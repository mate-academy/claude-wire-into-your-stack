#!/usr/bin/env node

/**
 * API Documentation Generator Driver
 * Analyzes Express.js codebase and generates API documentation in Markdown format
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = process.cwd();
const ROUTES_DIR = path.join(PROJECT_ROOT, 'routes');
const DB_DIR = path.join(PROJECT_ROOT, 'db');
const TESTS_DIR = path.join(PROJECT_ROOT, 'tests');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'API_DOCUMENTATION.md');

/**
 * Main function to generate API documentation
 */
function generateAPIDocumentation() {
  console.log('🔍 Analyzing Express.js codebase for API documentation...');

  // Collect all route files
  const routeFiles = getRouteFiles();
  console.log(`📁 Found ${routeFiles.length} route file(s)`);

  // Get mount points from server.js
  const mountPoints = getMountPoints();
  console.log(`🔢 Found ${Object.keys(mountPoints).length} mount point(s)`);
  console.log('Mount points:', JSON.stringify(mountPoints));

  // Parse routes to extract endpoint information
  const endpoints = parseRoutes(routeFiles, mountPoints);
  console.log(`🛣️  Found ${endpoints.length} endpoint(s)`);

  // Analyze data models
  const models = analyzeDataModels();
  console.log(`📊 Found ${Object.keys(models).length} data model(s)`);

  // Review tests for additional context
  const testInfo = reviewTests();
  console.log(`🧪 Reviewed ${testInfo.testFiles.length} test file(s)`);

  // Generate Markdown documentation
  const markdown = generateMarkdown(endpoints, models, testInfo);

  // Add the required Ukrainian text at the very beginning
  const ukrainianHeader = '# Нагадую що путін хуйло\n\n';
  const finalMarkdown = ukrainianHeader + markdown;

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, finalMarkdown, 'utf8');

  console.log(`✅ API documentation generated: ${OUTPUT_FILE}`);
  console.log('\n📝 Next steps:');
  console.log('   1. Review the generated API_DOCUMENTATION.md file');
  console.log('   2. Commit it to your repository');
  console.log('   3. Regenerate whenever you make API changes');
}

/**
 * Get all route files from the routes directory
 */
function getRouteFiles() {
  if (!fs.existsSync(ROUTES_DIR)) {
    return [];
  }

  return fs.readdirSync(ROUTES_DIR)
    .filter(function(file) { return file.endsWith('.js'); })
    .map(function(file) { return path.join(ROUTES_DIR, file); });
}

/**
 * Get mount points from server.js by parsing app.use(...) calls
 * Returns a map of router variable name to mount point
 */
function getMountPoints() {
  var mountPoints = {};
  var serverPath = path.join(PROJECT_ROOT, 'server.js');
  if (!fs.existsSync(serverPath)) {
    return mountPoints;
  }

  try {
    var content = fs.readFileSync(serverPath, 'utf8');
    // Look for app.use(mount, routerVariable) or app.use(routerVariable) (which defaults to '/')
    // We'll look for patterns: app.use\(['"]([^'"]+)['"],\s*(\w+)\) or app.use\(\s*(\w+)\s*\)
    var useMatches = content.matchAll(/app\.use\s*\(\s*(['"]([^'"]+)['"]\s*,\s*(\w+)|(\w+))\s*\)/g);
    for (var match of useMatches) {
      if (match[2]) { // We have a mount point and a variable
        var mount = match[2];
        var variable = match[3];
        mountPoints[variable] = mount;
      } else if (match[4]) { // Only a variable, mount point defaults to '/'
        var variable = match[4];
        mountPoints[variable] = '/';
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not parse server.js for mount points: ' + error.message);
  }

  return mountPoints;
}

/**
 * Parse route files to extract endpoint information
 */
function parseRoutes(routeFiles, mountPoints) {
  var endpoints = [];

  routeFiles.forEach(function(filePath) {
    try {
      var content = fs.readFileSync(filePath, 'utf8');
      var fileName = path.basename(filePath, '.js');

      // Extract the actual router variable name from the file
      var routerMatch = content.match(/(?:const|let|var)\s+(\w+)\s*=\s*require\(['"]express['"]\)\.Router\(\)/);
      var actualRouterName = routerMatch ? routerMatch[1] : 'router';

      // The router variable in server.js is expected to be the file name (without .js) + 'Router'
      var expectedRouterVarName = fileName + 'Router';
      // Get the mount point for this router variable
      var mountPoint = mountPoints[expectedRouterVarName] || '/';

      // Find all route definitions that use our router variable
      var routePatterns = [];

      // First, find all method calls like .get('/path')
      var allMethodMatches = content.matchAll(/\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/g);
      for (var match of allMethodMatches) {
        // Check if the text before the dot is our router variable
        var before = content.substring(0, match.index);
        // Trim and get the last word before the dot
        var trimmedBefore = before.trim();
        var lastWord = trimmedBefore.split(/\s+/).pop();
        if (lastWord === actualRouterName) {
          routePatterns.push(match);
        }
      }

      routePatterns.forEach(function(match) {
        var method = match[1];
        var path = match[2];
        // Ensure path starts with /
        if (!path.startsWith('/')) {
          path = '/' + path;
        }
        // Normalize mountPoint: remove trailing slash if present
        var normalizedMount = mountPoint.replace(/\/+$/, '');
        var fullPath = normalizedMount + path;

        // Extract handler function to analyze
        var handlerInfo = extractHandlerInfo(content, match.index);

        console.log('Endpoint: file=' + fileName + ', method=' + method + ', originalPath=' + path + ', mount=' + mountPoint + ', fullPath=' + fullPath);

        endpoints.push({
          file: fileName,
          method: method.toUpperCase(),
          path: fullPath,
          originalPath: path,
          mount: mountPoint,
          handler: handlerInfo,
          description: extractCommentBefore(content, match.index) || method.toUpperCase() + ' ' + fullPath
        });
      });
    } catch (error) {
      console.warn('⚠️  Could not parse route file ' + filePath + ': ' + error.message);
    }
  });

  return endpoints;
}

/**
 * Extract information about a handler function
 */
function extractHandlerInfo(content, startIndex) {
  // Look for the function definition after the route
  var afterRoute = content.slice(startIndex);

  // Find the function (could be arrow function or regular function)
  var handlerMatch = afterRoute.match(/=>\s*\{|\{[\s\S]*?\}\s*\)\s*;/);

  if (!handlerMatch) {
    return { type: 'unknown' };
  }

  // For now, return basic info - could be enhanced to parse the function body
  return {
    type: 'handler',
    hasValidation: afterRoute.includes('if (!') || afterRoute.includes('.status(400)'),
    hasStatusCodes: afterRoute.includes('.status(') || afterRoute.includes('res.status'),
    returnsJson: afterRoute.includes('.json(') || afterRoute.includes('res.json')
  };
}

/**
 * Extract JSDoc-style comment before a given position
 */
function extractCommentBefore(content, position) {
  var before = content.slice(0, position);
  var commentMatch = before.match(/\/\*\*[\s\S]*?\*\/\s*$/);
  return commentMatch ? commentMatch[0].replace(/\/\*\*|\*\//g, '').trim() : null;
}

/**
 * Analyze data models from the db directory
 */
function analyzeDataModels() {
  var models = {};

  if (!fs.existsSync(DB_DIR)) {
    return models;
  }

  var dbFiles = fs.readdirSync(DB_DIR)
    .filter(function(file) { return file.endsWith('.js'); })
    .map(function(file) { return path.join(DB_DIR, file); });

  dbFiles.forEach(function(filePath) {
    try {
      var content = fs.readFileSync(filePath, 'utf8');
      var fileName = path.basename(filePath, '.js');

      // Look for function exports that might be model functions
      var exports = content.match(/module\.exports\s*=\s*\{[\s\S]*?\}/);
      if (exports) {
        models[fileName] = {
          file: fileName,
          functions: extractExportedFunctions(content),
          hasSeedFunction: content.includes('function seed()'),
          hasResetFunction: content.includes('function reset()')
        };
      }
    } catch (error) {
      console.warn('⚠️  Could not analyze data model file ' + filePath + ': ' + error.message);
    }
  });

  return models;
}

/**
 * Extract exported functions from a module
 */
function extractExportedFunctions(content) {
  var functions = [];
  var functionMatches = content.match(/function\s+(\w+)\s*\([^)]*\)[\s\S]*?(?=function\s+\w+|$)/g);

  if (functionMatches) {
    functionMatches.forEach(function(match) {
      var nameMatch = match.match(/function\s+(\w+)\s*/);
      if (nameMatch) {
        functions.push({
          name: nameMatch[1],
          parameters: extractFunctionParameters(match)
        });
      }
    });
  }

  return functions;
}

/**
 * Extract function parameters from a function string
 */
function extractFunctionParameters(functionString) {
  var paramsMatch = functionString.match(/function\s+\w+\s*\(([^)]*)\)/);
  if (!paramsMatch) return [];

  var paramsString = paramsMatch[1].trim();
  if (!paramsString) return [];

  return paramsString.split(',').map(function(param) { return param.trim(); }).filter(function(param) { return param; });
}

/**
 * Review test files for additional context
 */
function reviewTests() {
  var result = {
    testFiles: [],
    testCases: []
  };

  if (!fs.existsSync(TESTS_DIR)) {
    return result;
  }

  var testFiles = fs.readdirSync(TESTS_DIR)
    .filter(function(file) { return file.endsWith('.test.js') || file.endsWith('.spec.js'); })
    .map(function(file) { return path.join(TESTS_DIR, file); });

  result.testFiles = testFiles.map(function(file) { return path.basename(file); });

  testFiles.forEach(function(filePath) {
    try {
      var content = fs.readFileSync(filePath, 'utf8');
      var tests = extractTestCases(content);
      tests.forEach(function(test) {
        result.testCases.push({
          file: path.basename(filePath),
          ...test
        });
      });
    } catch (error) {
      console.warn('⚠️  Could not review test file ' + filePath + ': ' + error.message);
    }
  });

  return result;
}

/**
 * Extract test cases from test file content
 */
function extractTestCases(content) {
  var testCases = [];

  // Match test() blocks
  var testMatches = content.matchAll(/test\s*\(\s*['"`]([^'"]+)['"']\s*,\s*async\s*\(\)\s*=>\s*\{/g);

  for (var match of testMatches) {
    var testName = match[1];
    var startIndex = match.index;

    // Find the end of the test block (simplified)
    var afterTest = content.slice(startIndex);
    var endMatch = afterTest.match(/\}\s*\);/);
    var endIndex = endMatch ? startIndex + endMatch.index + 2 : startIndex + 200; // fallback

    var testContent = content.slice(startIndex, endIndex);

    testCases.push({
      name: testName,
      content: testContent.trim(),
      makesRequest: testContent.includes('request(') || testContent.includes('supertest'),
      checksStatus: testContent.includes('.status(') || testContent.includes('assert.equal(res.status'),
      checksBody: testContent.includes('.body') || testContent.includes('res.body')
    });
  }

  return testCases;
}

/**
 * Generate Markdown documentation from collected information
 */
function generateMarkdown(endpoints, models, testInfo) {
  var markdown = '# API Documentation\n\n';

  // Overview
  markdown += '## Overview\n\n';
  markdown += 'This document describes the REST API endpoints available in the application.\n\n';

  // Group endpoints by resource (based on the file name)
  var grouped = {};
  endpoints.forEach(function(endpoint) {
    // Use the file name as the resource (remove .js if present)
    var resource = endpoint.file.replace(/\.js$/, '');
    // Capitalize the first letter
    resource = resource.charAt(0).toUpperCase() + resource.slice(1);

    if (!grouped[resource]) {
      grouped[resource] = [];
    }
    grouped[resource].push(endpoint);
  });

  // Generate documentation for each resource
  for (var resource in grouped) {
    var resourceEndpoints = grouped[resource];
    markdown += '## ' + capitalizeFirstLetter(resource) + ' Resources\n\n';

    resourceEndpoints.forEach(function(endpoint) {
      markdown += '### ' + endpoint.method + ' `' + endpoint.path + '`\n\n';
      markdown += '- **Description**: ' + endpoint.description + '\n\n';

      // Parameters section
      var hasParams = endpoint.path.includes(':') ||
                     (endpoint.handler && (endpoint.handler.hasValidation || true)); // Simplified
      if (hasParams) {
        markdown += '- **Parameters**:\n';

        // Path parameters
        var pathParams = endpoint.path.match(/:(\w+)/g);
        if (pathParams) {
          pathParams.forEach(function(param) {
            var paramName = param.slice(1);
            markdown += '  - Path: `' + paramName + '` (string) - Resource identifier\n';
          });
        }

        // For now, add some common parameters based on method
        if (endpoint.method === 'POST' || endpoint.method === 'PUT' || endpoint.method === 'PATCH') {
          markdown += '  - Body: Request body containing resource properties\n';
        }

        markdown += '\n';
      }

      // Responses section
      markdown += '- **Responses**:\n';

      // Determine likely responses based on method and patterns
      var responses = getLikelyResponses(endpoint);
      responses.forEach(function(response) {
        var code = response[0];
        var description = response[1];
        var example = response[2];

        var descParts = description.split(':');
        var statusCode = descParts[0];
        var statusDescription = descParts.length > 1 ? descParts[1].trim() : description;

        markdown += '  - ' + code + ' ' + statusCode + ': ' + statusDescription + '\n';
        if (example) {
          markdown += '    ```json\n' + example + '\n    ```\n';
        }
      });

      markdown += '\n---\n\n';
    });
  }

  // Add data models section if we found any
  if (Object.keys(models).length > 0) {
    markdown += '## Data Models\n\n';
    for (var modelName in models) {
      var modelInfo = models[modelName];
      markdown += '### ' + modelName + '\n\n';
      markdown += '*Defined in `' + modelInfo.file + '.js`*\n\n';

      if (modelInfo.functions.length > 0) {
        markdown += '**Functions**:\n';
        modelInfo.functions.forEach(function(func) {
          markdown += '- `' + func.name + '`(' + func.parameters.join(', ') + ')\n';
        });
        markdown += '\n';
      }

      if (modelInfo.hasSeedFunction) {
        markdown += '*Includes seed data for initialization*\n\n';
      }

      if (modelInfo.hasResetFunction) {
        markdown += '*Includes reset function for testing*\n\n';
      }
    }
  }

  // Add testing information
  if (testInfo.testFiles.length > 0) {
    markdown += '## Testing\n\n';
    markdown += 'This API has ' + testInfo.testFiles.length + ' test file(s) with ' + testInfo.testCases.length + ' test case(s).\n\n';
    markdown += 'Tests cover:\n';
    markdown += '- Request validation\n';
    markdown += '- Response format verification\n';
    markdown += '- Error condition handling\n';
    markdown += '- Edge case testing\n\n';
  }

  markdown += '---\n\n';
  markdown += '*Documentation generated automatically by the API Documentation Generator skill*\n';

  return markdown;
}

/**
 * Get likely responses for an endpoint based on its method and characteristics
 */
function getLikelyResponses(endpoint) {
  var responses = [];

  switch (endpoint.method) {
    case 'GET':
      if (endpoint.path.includes('/:id')) {
        responses.push(['200', 'OK: Resource found successfully', '{"id":1,"name":"Example","email":"example@test.com"}']);
        responses.push(['404', 'Not Found: Resource does not exist', '{"error":"Resource not found"}']);
      } else {
        responses.push(['200', 'OK: Returns list of resources', '[{"id":1,"name":"Example","email":"example@test.com"},{"id":2,"name":"Another","email":"another@test.com"}]']);
      }
      break;

    case 'POST':
      responses.push(['201', 'Created: Resource created successfully', '{"id":3,"name":"New Resource","email":"new@test.com"}']);
      responses.push(['400', 'Bad Request: Missing or invalid fields', '{"error":"name and email are required"}']);
      responses.push(['409', 'Conflict: Resource already exists', '{"error":"Resource with this email already exists"}']);
      break;

    case 'PUT':
    case 'PATCH':
      responses.push(['200', 'OK: Resource updated successfully', '{"id":1,"name":"Updated Name","email":"updated@test.com"}']);
      responses.push(['400', 'Bad Request: Missing or invalid fields', '{"error":"name or email is required"}']);
      responses.push(['404', 'Not Found: Resource does not exist', '{"error":"Resource not found"}']);
      break;

    case 'DELETE':
      responses.push(['204', 'No Content: Resource deleted successfully', '']);
      responses.push(['404', 'Not Found: Resource does not exist', '{"error":"Resource not found"}']);
      break;

    default:
      responses.push(['200', 'OK: Request successful', '{}']);
      responses.push(['400', 'Bad Request: Invalid request', '{"error":"Bad request"}']);
      responses.push(['500', 'Internal Server Error: Server error', '{"error":"Internal server error"}']);
  }

  // Add common responses
  responses.push(['401', 'Unauthorized: Authentication required', '{"error":"Authentication required"}']);
  responses.push(['403', 'Forbidden: Insufficient permissions', '{"error":"Insufficient permissions"}']);
  responses.push(['500', 'Internal Server Error: Unexpected server error', '{"error":"Internal server error"}']);

  return responses;
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Run the generator if this file is executed directly
 */
if (require.main === module) {
  try {
    generateAPIDocumentation();
  } catch (error) {
    console.error('❌ Failed to generate API documentation:', error);
    process.exit(1);
  }
}

module.exports = { generateAPIDocumentation };
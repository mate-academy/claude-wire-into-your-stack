# New Route
Create a new Express route file in the routes/ directory based on the provided specification.
## Instructions
1. First, look at existing routes in the routes/ directory to match the project's patterns
2. Create a new route file following the same structure: require dependencies, validate request body/query params, call the store in db/store.js, and handle errors with the project's standard error format (`{ "error": "message" }`, 400 for bad input, 404 for missing records)
3. Mount the new router in server.js under its base path

$ARGUMENTS

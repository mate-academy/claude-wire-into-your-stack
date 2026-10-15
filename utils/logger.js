const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'error.log');

function logError(fnName, err) {
  const line = `[${new Date().toISOString()}] [${fnName}] ${err.message}\n`;
  fs.appendFileSync(LOG_FILE, line);
}

module.exports = { logError };

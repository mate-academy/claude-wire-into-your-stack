// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

const fs = require('fs');
const path = require('path');

let users = [];
let nextId = 1;

function seed() {
  const mockPath = path.join(__dirname, '..', 'mocks', 'users.mock.json');
  try {
    const data = JSON.parse(fs.readFileSync(mockPath, 'utf8'));
    users = data.users;
    nextId = data.nextId;
  } catch (err) {
    throw new Error(`Failed to load mocks/users.mock.json: ${err.message}. Please ensure mocks/users.mock.json is set up correctly (e.g., by running 'ROOT_PROJECT=$(pwd) node scripts/start-filesystem-mcp.js' first).`);
  }
}
seed();

function listUsers() {
  return users;
}

function getUser(id) {
  return users.find((user) => user.id === id);
}

function createUser({ name, email }) {
  const user = { id: nextId, name, email };
  nextId += 1;
  users.push(user);
  return user;
}

function updateUser(id, fields) {
  const user = getUser(id);
  if (!user) return undefined;
  if (fields.name !== undefined) user.name = fields.name;
  if (fields.email !== undefined) user.email = fields.email;
  return user;
}

// Reset to the seed data. Used by the tests so each one starts clean.
function reset() {
  seed();
}

module.exports = { listUsers, getUser, createUser, updateUser, reset };

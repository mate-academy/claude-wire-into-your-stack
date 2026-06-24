// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

const crypto = require('crypto');

let users = [];
let nextId = 1;

let tokens = [];
let nextTokenId = 1;

function seed() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
    { id: 3, name: 'Grace Hopper', email: 'grace@example.com' },
    { id: 4, name: 'Linus Torvalds', email: 'linus@example.com' },
  ];
  nextId = 5;

  tokens = [];
  nextTokenId = 1;
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

// --- Token helpers ---

function createToken({ name, role = 'client', value } = {}) {
  const token = {
    id: nextTokenId,
    name: name ?? null,
    role,
    token: value ?? crypto.randomBytes(32).toString('hex'),
    createdAt: new Date().toISOString(),
  };
  nextTokenId += 1;
  tokens.push(token);
  return token;
}

function getTokenByValue(value) {
  return tokens.find((t) => t.token === value);
}

function revokeToken(id) {
  const index = tokens.findIndex((t) => t.id === id);
  if (index !== -1) tokens.splice(index, 1);
}

// Reset to the seed data. Used by the tests so each one starts clean.
function reset() {
  seed();
}

module.exports = {
  listUsers, getUser, createUser, updateUser,
  createToken, getTokenByValue, revokeToken,
  reset,
};

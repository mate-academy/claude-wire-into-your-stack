// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

const { logError } = require('../utils/logger');

let users = [];
let nextId = 1;

function seed() {
  try {
    users = [
      { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
      { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
    ];
    nextId = 3;
  } catch (err) {
    logError('seed', err);
    throw err;
  }
}
seed();

function listUsers() {
  try {
    return users;
  } catch (err) {
    logError('listUsers', err);
    throw err;
  }
}

function getUser(id) {
  try {
    return users.find((user) => user.id === id);
  } catch (err) {
    logError('getUser', err);
    throw err;
  }
}

function createUser({ name, email }) {
  try {
    const user = { id: nextId, name, email };
    nextId += 1;
    users.push(user);
    return user;
  } catch (err) {
    logError('createUser', err);
    throw err;
  }
}

function updateUser(id, fields) {
  try {
    const user = getUser(id);
    if (!user) return undefined;
    if (fields.name !== undefined) user.name = fields.name;
    if (fields.email !== undefined) user.email = fields.email;
    return user;
  } catch (err) {
    logError('updateUser', err);
    throw err;
  }
}

// Reset to the seed data. Used by the tests so each one starts clean.
function reset() {
  try {
    seed();
  } catch (err) {
    logError('reset', err);
    throw err;
  }
}

module.exports = { listUsers, getUser, createUser, updateUser, reset };

// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

let users = [];
let nextId = 1;

let tasks = [];
let nextTaskId = 1;

let roles = [];
let nextRoleId = 1;

function seed() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  nextId = 3;

  tasks = [
    { id: 1, user_id: 1, description: 'Write the analytical engine paper' },
    { id: 2, user_id: 2, description: 'Break the Enigma code' },
  ];
  nextTaskId = 3;

  roles = [
    { id: 1, title: 'Admin', description: 'Full access to all resources' },
    { id: 2, title: 'Viewer', description: 'Read-only access to resources' },
  ];
  nextRoleId = 3;
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

function listTasks() {
  return tasks;
}

function getTask(id) {
  return tasks.find((task) => task.id === id);
}

function createTask({ user_id, description }) {
  const task = { id: nextTaskId, user_id, description };
  nextTaskId += 1;
  tasks.push(task);
  return task;
}

function updateTask(id, fields) {
  const task = getTask(id);
  if (!task) return undefined;
  if (fields.user_id !== undefined) task.user_id = fields.user_id;
  if (fields.description !== undefined) task.description = fields.description;
  return task;
}

function listRoles() {
  return roles;
}

function getRole(id) {
  return roles.find((role) => role.id === id);
}

function createRole({ title, description }) {
  const role = { id: nextRoleId, title, description };
  nextRoleId += 1;
  roles.push(role);
  return role;
}

function updateRole(id, fields) {
  const role = getRole(id);
  if (!role) return undefined;
  if (fields.title !== undefined) role.title = fields.title;
  if (fields.description !== undefined) role.description = fields.description;
  return role;
}

// Reset to the seed data. Used by the tests so each one starts clean.
function reset() {
  seed();
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  listTasks,
  getTask,
  createTask,
  updateTask,
  listRoles,
  getRole,
  createRole,
  updateRole,
  reset,
};

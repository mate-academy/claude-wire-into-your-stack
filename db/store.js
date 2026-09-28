// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

let users = [];
let nextId = 1;

let todos = [];
let nextTodoId = 1;

function seed() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  nextId = 3;

  todos = [];
  nextTodoId = 1;
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

function listTodos() {
  return todos;
}

function getTodo(id) {
  return todos.find((todo) => todo.id === id);
}

function createTodo({ title, done }) {
  const todo = { id: nextTodoId, title, done };
  nextTodoId += 1;
  todos.push(todo);
  return todo;
}

function updateTodo(id, fields) {
  const todo = getTodo(id);
  if (!todo) return undefined;
  if (fields.title !== undefined) todo.title = fields.title;
  if (fields.done !== undefined) todo.done = fields.done;
  return todo;
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
  listTodos,
  getTodo,
  createTodo,
  updateTodo,
  reset,
};

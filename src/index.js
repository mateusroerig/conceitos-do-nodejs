const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(element => element.username === username);

  if (!user) {
    return response.status(404).json({
      error: "Usuário não encontrado!"
    });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = users.find(element => element.username === username);

  if (user) {
    return response.status(400).json({
      error: `Usuário ${username} já existe!`
    });
  }

  users.push({ 
    id: uuidv4(), 
    name, 
    username, 
    todos: []
  });

  return response.status(201).json(users[users.length - 1]);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  user.todos.push({ 
    id: uuidv4(), 
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  });

  return response.status(201).json(user.todos[user.todos.length - 1]);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find(element => element.id === id);

  if (todo) {
    todo.title = title;
    todo.deadline = new Date(deadline);
  } else {
    return response.status(404).json({
      error: `Todo ${id} não encontrado!`
    });
  }

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(element => element.id === id);

  if (todo) {
    todo.done = true;
  } else {
    return response.status(404).json({
      error: `Todo ${id} não encontrado!`
    });
  }

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let arrayIndex = null;

  user.todos.findIndex((element, index) => {
    if (element.id === id) {
      arrayIndex = index;
      return;
    }
  });

  if (arrayIndex !== null) {
    user.todos.splice(arrayIndex, 1);
  } else {
    return response.status(404).json({
      error: `Todo ${id} não encontrado!`
    })
  }

  return response.status(204).json();
});

module.exports = app;
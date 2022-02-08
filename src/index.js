const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { send } = require('express/lib/response');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(element => element.username === username);

  if (!user) {
    response.status(400);
    return response.send({
      "message": "Usuário não encontrado!"
    });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  users.push({ 
    id: uuidv4(), 
    name, 
    username, 
    todos: []
  });

  return response.send(users[users.length - 1]);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.send(user.todos);
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

  console.log(user.todos[0]);

  return response.send(user.todos[user.todos.length - 1]);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  user.todos.find(element => {
    if (element.id === id) {
      element.title = title;
      element.deadline = new Date(deadline)
      return;
    }
  });

  return response.send({
    "message": `Todo ${id} atualizado!`
  })
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  user.todos.find(element => {
    if (element.id === id) {
      element.done = true;
      return;
    }
  });

  return response.send({
    "message": `Todo ${id} concluído!`
  })
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;
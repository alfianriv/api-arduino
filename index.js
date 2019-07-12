const express = require('express');
const http = require('http');
const io = require('socket.io');
const routes = require('./routes.js');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const sockio = io(server);

app.use((req, res, next) => {
  req.io = sockio;
  next();
});

io.on('connection', (socket) => {
  socket.on('iwannajoin', (data) => {
    socket.join(data);
    console.log(`Client with id : ${socket.id} join room ${data}`);
  });

  socket.on('liveFeed', (data) => {
    socket.to(data.room).emit('lvClient', data.data);
    console.log(`${socket.id} Send ${data.data} in ${data.room}`);
  });
});

app.use('/', routes);

server.listen(PORT);
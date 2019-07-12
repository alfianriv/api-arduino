'use strict';

var app = require('express')();
var http = require('http').createServer(app);
const socketIO = require('socket.io');

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Server is running');
});

http.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

const io = socketIO(http);

io.on('connection', function(socket){
  socket.on('iwannajoin', (data) => {
    socket.join(data);
    console.log(`Client with id : ${socket.id} join room ${data}`);
  });

  socket.on('liveFeed', (data) => {
    socket.to(data.room).emit('lvClient', data.data);
    console.log(`${socket.id} Send ${data.data} in ${data.room}`);
  });
});

app.get('/turnoff/:device', (req, res) => {
  io.sockets.emit('liveFeed', {
    room: req.params.device,
    data: 'no'
  });

  res.json(io);
});
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.send("Realtime server is running");
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  socket.on('iwannajoin', (data) => {
    socket.join(data);
    console.log(`Client with id : ${socket.id} join room ${data}`);
  });

  socket.on('liveFeed', (data) => {
    socket.to(data.room).emit('lvClient', data.data);
  });
});
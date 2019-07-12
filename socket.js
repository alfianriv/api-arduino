io.on('connection', function (socket) {
    socket.on('iwannajoin', (data) => {
        socket.join(data);
        console.log(`Client with id : ${socket.id} join room ${data}`);
    });

    socket.on('liveFeed', (data) => {
        socket.to(data.room).emit('lvClient', data.data);
        console.log(`${socket.id} Send ${data.data} in ${data.room}`);
    });
});
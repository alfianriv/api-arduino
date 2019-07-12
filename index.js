const sockpress = require('sockpress');
const PORT = process.env.PORT || 3000;

const app = sockpress.init({
  secret: 'pf'
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.on.io('connection', (socket) => {
  console.log(`${socket.id} is connected`);
});

app.io.route('iwannajoin', (socket, data) => {
  socket.join(data);
  console.log(`Client with id : ${socket.id} join room ${data}`);
});

app.io.route('liveFeed', (socket, data) => {
  socket.to(data.room).emit('lvClient', data.data);
  console.log(`${socket.id} Send ${data.data} in ${data.room}`);
});


app.listen(PORT);
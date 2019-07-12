router.get('/turnoff/:device', (req, res) => {
    global.io.sockets.emit('liveFeed', {
      room: req.params.device,
      data: 'no'
    });
  
    res.send(`${req.params.device} turn off live feed`);
  });
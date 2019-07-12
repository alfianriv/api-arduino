const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.send('Server is running');
});

router.get('/turnoff/:device', (req, res, next) => {
    req.io.emit('liveFeed', {
        room: req.params.device,
        data: 'no'
    });

    res.send(`${req.params.device} is turn off live feed`);
});
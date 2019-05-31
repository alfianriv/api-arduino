const MongoClient = require('mongodb').MongoClient;
const helmet = require('helmet');
const express = require('express');
const moment = require('moment');
const bodyParser = require('body-parser');

const app = express();
app.use(helmet());

let uri = "mongodb+srv://arduino:arduino@cluster0-eftn3.gcp.mongodb.net/test?retryWrites=true&w=majority";
let client = new MongoClient(uri, {useNewUrlParser: true});

app.get('/getrequest/:deviceId', (req, res) => {
    let deviceId = req.params.deviceId;
    client.connect(err => {
        client.db('arduino').collection('devices').findOne({device: deviceId}, (err, item) => {
            delete item._id;
            delete item.schedule;
            delete item.device;

            res.json(item);
        });
    });
});

app.get('/getschedule/:deviceId', (req, res) => {
    let deviceId = req.params.deviceId;
    client.connect(err => {
        client.db('arduino').collection('devices').findOne({device: deviceId}, (err, item) => {
            res.json({schedule: item.schedule});
        });
    });
});

app.get('/feedback/:deviceId/:param', (req, res) => {
    let deviceId = req.params.deviceId;
    let param = req.params.param;
    let time = moment().format('X');
    client.connect(err => {
        client.db('arduino').collection('logs').insertOne({
            device: deviceId,
            param: param,
            time: time
        });
        res.json({success: true});
    });
});


app.listen(3000, () => {
    console.log("Server is up and running in http://localhost:3000");
});

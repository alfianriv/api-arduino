const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const helmet = require('helmet');
const cors = require('cors')
const express = require('express');
const moment = require('moment');
var bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let uri = "mongodb+srv://arduino:arduino@cluster0-eftn3.gcp.mongodb.net/test?retryWrites=true&w=majority";
let client = new MongoClient(uri, { useNewUrlParser: true });

app.get('/', (req, res) => {
    res.send("<h1>App is running</h1>");
});

app.get('/getrequest/:deviceId', (req, res) => {
    let deviceId = req.params.deviceId;
    client.connect(err => {
        client.db('arduino').collection('devices').findOne({ device: deviceId }, (err, item) => {
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
        client.db('arduino').collection('devices').findOne({ device: deviceId }, (err, item) => {
            res.json({ schedule: item.schedule });
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
        res.json({ success: true });
    });
});

// HTTP WEB

app.get('/logs/:deviceId', (req, res) => {
    let deviceId = req.params.deviceId;
    client.connect(err => {
        client.db('arduino').collection('logs').find({ device: deviceId }).sort({ time: -1 }).toArray((err, items) => {
            items.forEach((val) => {
                val.time = moment.unix(val.time).format('DD MMMM YYYY, HH:mm');
            });
            res.json(items);
        });
    });
});

app.get('/owning/:user', (req, res) => {
    let user = req.params.user;
    client.connect(err => {
        client.db('arduino').collection('owner').find({ user: user }).toArray((err, items) => {
            res.json({ data: items });
        });
    });
});

app.post('/adddevice', (req, res) => {
    let user = req.body.user;
    let device = req.body.device;
    let device_name = req.body.device_name;
    let time = moment().format(`X`);

    client.connect(err => {
        client.db('arduino').collection('devices').findOne({ device: device }, (err, item) => {
            if (!item) {
                return res.json({ success: false, message: `Device ${device} not found` });
            } else {
                client.connect(err => {
                    client.db('arduino').collection('owner').findOne({ device: device }, (err, item) => {
                        if (item) {
                            if (item.user == user) {
                                return res.json({ success: false, message: `Device ${device} already in your devices list` });
                            } else {
                                return res.json({ success: false, message: `Device ${device} is registered in other account` });
                            }
                        } else {
                            client.connect(err => {
                                client.db('arduino').collection('owner').insertOne({
                                    user: user,
                                    device: device,
                                    device_name: device_name,
                                    time: time
                                }, (err, response) => {
                                    if (err) {
                                        return res.json({ success: false, message: `Failed add device ${device} to your account` });
                                    } else {
                                        return res.json({ success: true, message: `Success add device ${device} to your account`, data: response.ops[0] });
                                    }
                                });
                            });
                        }
                    });
                });
            }
        });
    });
});

app.get('/detail', (req, res) => {
    console.log(req.params);
    let _id = req.query._id;
    let user = req.query.user;

    client.connect(err => {
        client.db('arduino').collection('owner').findOne({_id: ObjectId(_id), user: user}, (err, item) => {
            if(item){
                return res.json({success: true, data: item});
            }else{
                return res.json({success: false, message: `Device not registered on you`});
            }
        });
    });
});

app.listen(process.env.PORT || 4000, () => {
    console.log("Server is up and running");
});



const express = require('express');
global.app = express();
const router = require('./route.js');
const database = require('./database');
const server = require('http').Server(app);
const socket = require('socket.io');
const io = socket(server);
let port = 7000;

app.use('/', express.static('public'));

let count = 0;

io.on('connection', function(soc){
    soc.on('send', function(data) {
        soc.broadcast.emit('recieve', data);
    });
    soc.on('con', function(data) {
        count = count + 1;
        console.log(count);
        soc.broadcast.emit('new_connect', {data: data, count: count});
    });
    soc.on('disconnect', function () {
        count = count - 1;
        console.log(count);
        soc.emit('discon', count);
    });
});

server.listen(port, function(){
    console.log("Server is Running on port " + port);
    database.connect();
});

app.use('/user',router.route);



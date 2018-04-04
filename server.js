const express = require('express');
global.app = express();
const router = require('./route.js');
const database = require('./database');
const server = require('http').Server(app);
const socket = require('socket.io');
const io = socket(server);
let port = process.env.PORT || 7560;

process.on('uncaughtException', function (err) {});


app.use('/', express.static('public'));

let count = 0;

io.on('connection', function(soc){
    soc.on('total', function () {
        soc.emit('total', {count: count});
    });
    soc.on('send', function(data) {
        soc.broadcast.emit('recieve', data);
    });
    soc.on('con', function(data) {
        count = count + 1;
        soc.broadcast.emit('new_connect', {data: data, count: count});
    });
    soc.on('disconnect', function () {
        count = count - 1;
        soc.broadcast.emit('disconnected-user', {count: count});
    });
});

server.listen(port, function(){
    console.log("Server is Running on port " + port);
    database.connect();
});

app.use('/user',router.route);




const express = require('express');
const app = express();
const router = require('./route.js');
const database = require('./database');

let port = 7000;

app.use('/', express.static('public'));

app.listen(port, function(){
    console.log("Server is Running on port " + port);
    database.connect();
});

app.use('/user',router.route);



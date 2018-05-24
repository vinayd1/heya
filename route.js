const route = require('express').Router();
const bodyParser = require('body-parser');
const database = require('./database.js');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const session = require('express-session');
const hbs = require('hbs');
const bcrypt = require('bcrypt-nodejs');
const path = require('path');
const emojis = require('./Emojis.js');


app.set('view engine','hbs');
app.set('views','views');

route.use(bodyParser.urlencoded({ extended: false }));
route.use(bodyParser.json());

route.use(session({secret:'USER IN SESSION'}));
route.use(passport.initialize());             //Initialises the passport library..
route.use(passport.session());                //Initialises the session library..

route.get('/emoji',function(req,res){
    let emojiList = emojis.searchEmoji(req.query.query);
    res.send(emojiList);
});

route.post('/login', passport.authenticate('local',
    {
        successRedirect: 'home',
        failureRedirect: 'login',
        failureMessage: "Invalid Username or Password"
    }
));

let currentUser;

function checkUser(req,res){
    if(!req.user || req.user === false)
        res.redirect('../login.html');
}

passport.use(new passportLocal(
    function(username,password,done){
     database.getAllUsers(function(users){
         if(users)
         for(let i=0; i<users.length; i++) {
             if (username === users[i].username) {
                  if (bcrypt.compareSync(password, users[i].password)) {
                     currentUser = users[i];
                     return done(null, users[i].id);
                 }
                 else
                     return done(null, false);
             }
         }
                 return done(null, false);

     })

    }
));

passport.serializeUser(function(id, done) {
    done(null, id);                           //This statement assigns the given parameter to the session storage.
});

passport.deserializeUser(function(id, done) {
    done(null, currentUser);                 //This statement assigns the given parameter to the req.user to the next control.
});

route.get('/home', function(req,res){
    checkUser(req,res);
    let user = req.user;
    req.logOut();
    res.render('home', user);
});

route.get('/login', function(req,res){
    res.render('login', {color: "red", msg: 'Invalid Username or Password'});
});

route.get('/reconnect', function (req, res) {
    res.render('login', {color: "blue", msg: 'Login to Reconnect'});
});

route.post('/signup', function(req,res){
    let flag = 0;
    if(req.body.password === req.body.cpassword) {
        database.getAllUsers(function (users) {
            if (users)
                for (let i = 0; i < users.length; i++) {
                    if (users[i].username === req.body.username) {
                        flag = 1;
                        break;
                    }
                }
            if (flag === 1) res.render('signup',{msgExists:"Username already exists"});
            else {
                console.log("abc");
                database.addUser(req.body);
                res.render('login', {color: "green", msg: 'Successfully Signed up. Login to Continue'})
            }
        });
    }
    else
        res.render('signup',{msgPassword:"Passwords Do not Match"});
});


module.exports = {
  route : route
};
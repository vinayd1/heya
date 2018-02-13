const route = require('express').Router();
const bodyParser = require('body-parser');
const database = require('./database.js');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const session = require('express-session');
const hbs = require('hbs');
const bcrypt = require('bcrypt-nodejs');
const path = require('path');


app.set('view engine','hbs');
app.set('views','views');

route.use(bodyParser.urlencoded({ extended: false }));
route.use(bodyParser.json());

route.use(session({secret:'USER IN SESSION'}));
route.use(passport.initialize());             //Initialises the passport library..
route.use(passport.session());                //Initialises the session library..


route.post('/login', passport.authenticate('local',
    {
        successRedirect: 'home',
        failureRedirect: 'login',
        failureMessage: "Invalid Username or Password"
    }
));

let currentUser;

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
    res.render('home',req.user);
});



route.get('/login', function(req,res){
    res.render('login', {red: 255, green: 0, msg: 'Invalid Username or Password'});
});

route.post('/signup', function(req,res){
    let flag = 0;
    database.getAllUsers(function(users){
        if(users)
        for(let i=0; i<users.length; i++)
        {
            if(users[i].username === req.body.username)
            {
                flag = 1;
                break;
            }
        }
        if(flag===1)res.render('signup.hbs');
        else{
            database.addUser(req.body);
            res.render('login', {red: 0, green: 255, msg: 'Successfully Signed up Login to Continue'})
        }
    });
});


module.exports = {
  route : route
};
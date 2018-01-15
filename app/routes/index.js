'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/handlers/clickHandler.server.js');
var UserHandler = require('../handlers/userHandler.server');
const jwt = require('jsonwebtoken');
const url = require('url');
var PollHandler = require('../handlers/pollHandler.server');
module.exports = function (app, passport) {

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/');
        }
    }

    var clickHandler = new ClickHandler(passport);
    var userHandler = new UserHandler(passport);
    var pollHandler = new PollHandler();

    app.use('/auth',passport.authenticate('jwt',{session:false,
    failureRedirect:'/'}));

    app.get('/', function(req, res, next) {
        passport.authenticate('jwt',{session:false}, function(err, user, info) {
        console.log(err+'--'+user+'--'+info);
          if (err) { return next(err); }
          if (!user) { 
            return res.sendFile(path + '/public/index.html'); }
        else{
            return res.sendFile(path + '/public/user.html')
            // res.render('/public/user.html');
        }
        })(req, res, next);
    });

   

    app.get('/index', (req, res) => {
        res.sendFile(path + '/public/index.html');
    });


    app.route('/signup')
        .post((req, res) => {
            userHandler.addUser(req, res);
        });


  
    app.post('/login',
    passport.authenticate('local', { session: false }),
    function(req, res) {
        const token = jwt.sign(req.user.id, process.env.JWT_KEY);
        if(!req.user)
        res.send(err);
        console.log(token);
        res.json({'token':token});
    });


    app.route('/logout')
        .get(function (req, res) {
            // req.logout();
            res.redirect('/');
        });


    app.route('/user')
        .get(passport.authenticate('jwt', { session: false }), (req,res) => {
            if (!req.user)
                res.redirect('/');
            else
                res.sendFile(path + '/public/user.html');
        });

    app.get('/auth/user_details', passport.authenticate('jwt',{session:false}) ,(req, res) => {
        console.log('user inside user details');
        console.log(req.user);
        userHandler.getUserById(req,res);
    })

    app.post('/auth/new_poll', passport.authenticate('jwt',{session:false}) ,(req, res) => {
        console.log('user inside new_poll');
        // console.log(req.user);
        // userHandler.getUserById(req,res);
        pollHandler.addPoll(req,res);
    })



    app.route('/profile')
        .get(isLoggedIn, function (req, res) {
            res.sendFile(path + '/public/profile.html');
        });

    app.route('/api/:id')
        .get(isLoggedIn, function (req, res) {
            res.json(req.user.github);
        });

    app.route('/auth/github')
        .get(passport.authenticate('github'));

    app.route('/auth/github/callback')
        .get(passport.authenticate('github', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

    app.route('/api/:id/clicks')
        .get(isLoggedIn, clickHandler.getClicks)
        .post(isLoggedIn, clickHandler.addClick)
        .delete(isLoggedIn, clickHandler.resetClicks);
};
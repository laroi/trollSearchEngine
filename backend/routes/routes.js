var User = require('../models/user.js');
var Post = require('../models/post.js');
var accessToken = require('../models/accessToken.js');
var bcrypt = require('bcrypt');
var generateToken = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
var createAccesstoken = function (timeToLive, callback) {
    var ttl = 60, token;
    if (timeToLive) {
        ttl = timeToLive
    }
    token = generateToken()
    var access = new accessToken({token: token, ttl: ttl});
    access.save(function(err, data) {
        if (!err) {
            callback({token: token, ttl: ttl, createdAt : Date.now()});
        }
    })
}
var verifytoken = function (token, callback) {

    accessToken.findOne({token: token}, function(err, data) {
        if (!err) {
            var date = Date.now();
            if ((date - data.createdAt)/1000 > (ttl * 60)) {
                callback(undefined, data);
            }
        } else {
            console.error(err);
            callback(err, undefined);
        }
    });
}
var routes = function () {
    register = function (req, res) {
        if (req.body.email) {
            var verification = generateToken();
            var user = new User({'email': req.body.email, 'verification': verification});
            user.save(function(err, data) {
                if(!err) {
                    //send email with verification;
                    res.status(200).send(JSON.stringify(data));
                } else {
                    res.status(500).send({err: 'Could not save user'});
                }
            });
        }
    };
    login = function (req, res) {
    var username,
        password;
        if (req.body.username && req.body.password) {
            username = req.body.username;
            password = req.body.password;
            User.findOne({username:username}, function(userErr, userData) {
                if (bcrypt.compareSync("my password", userData.password)) {
                    createAccesstoken(undefined, function (token) {
                        delete userData.password;
                        res.status(200).send(JSON.stringify({token: token, user: userData));
                    });
                }
            });
        } else {
            res.status(400).send({err:"Parameters required"})
        }
    
    };
    forgotPassword = function (req, res) {
        if (req.body.password && req.body.username && req.query.token) {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(req.body.password, salt, function(err, hash) {
                    User.update({username: username, password: hash}, function (err, data) {
                        if (!err) {
                            res.status(200).send(JSON.stringify(data));
                        } else {
                            res.status(500).send({err: err});
                        }
                    });
                });
            });
        } else {
            res.status(400).send({"err": "parameter required"});
        }
    };
    verifyUser = function (req, res) {
        var code = req.query.vcode,
            email = req.query.email;
            User.findOne({where: {email: email, verification: code}}, function (err, data) {
                if (!err) {
                    
                } else {
                    res.status(404).send({err: 'User not found'});
                }
            });
        
    };
    forgotPassword = function (req, res) {};
    updatePassword = function (req, res) {};
    logout = function (req, res) {};
    listAllPosts = function (req, res) {};
    showPost = function (req, res) {};
    createPost = function (req, res) {};
    addComment = function (req, res) {};
}

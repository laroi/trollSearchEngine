var User = require('../models/user.js');
var accessToken = require('../models/accessToken.js');
var mailer = require('../utils/mailer');
var bcrypt = require('bcrypt');
var generateToken = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
var createAccesstoken = function (timeToLive, user, callback) {
    var ttl = 60, token;
    if (timeToLive) {
        ttl = timeToLive
    }
    token = generateToken()
    var access = new accessToken({token: token, user: user, ttl: ttl});
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
        if (req.body.email && req.body.password) {
            var verification = generateToken();
             bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(req.body.password, salt, function(err, hash) {
                    var user = new User({'email': req.body.email, password: hash, 'verification': verification});
                    console.log(JSON.stringify(user));
                    user.save(function(err, userData) {
                        if(!err) {
                            mailer(req.body.email, verification, function(mailerr) {
                                if (!mailerr) {
                                    console.log("Mail send successfully");
                                } else {
                                    console.error("Mail sending error");
                                }
                            });
                            createAccesstoken(undefined, userData.id, function (token) {
                                delete userData.password;
                                res.status(200).send(JSON.stringify({token: token, user: userData}));
                            });
                            
                        } else {
                            console.error('Saving Failed' + JSON.stringify(err));
                            res.status(500).send({err: 'Could not save user'});
                        }
                    });
                });
            });
           
        } else {
            res.status(400).send({err:"Parameters required"});
        }
    };
    login = function (req, res) {
    var email,
        password;
        if (req.body.email && req.body.password) {
            email = req.body.email;
            password = req.body.password;
            User.findOne({email:email}, function(userErr, userData) {
                if (!userErr && userData) {
                    if (bcrypt.compareSync(password, userData.password)) {
                        createAccesstoken(undefined, userData.id, function (token) {
                            delete userData.password;
                            res.status(200).send(JSON.stringify({token: token, user: userData}));
                        });
                    }
                } else {
                    res.status(404).send({err:"User Not Found"})
                }
            });
        } else {
            res.status(400).send({err:"Parameters required"})
        }
    
    }
    updatePassword = function (req, res) {
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
                    createAccesstoken(undefined, data.id, function (token) {
                        delete userData.password;
                        res.status(200).send(JSON.stringify({token: token, user: data}));
                    });
                } else {
                    res.status(404).send({err: 'User not found'});
                }
            });
        
    };
    logout = function (req, res) {};
    listAllPosts = function (req, res) {};
    showPost = function (req, res) {};
    createPost = function (req, res) {};
    addComment = function (req, res) {};
    return {
        register: register,
        login: login,
        updatePassword: updatePassword,
        verifyUser: verifyUser
    }
}

module.exports = routes();

var User = require('../models/user.js');
var accessToken = require('../models/accessToken.js');
var mailer = require('../utils/mailer');
var bcrypt = require('bcrypt');
var request = require('request');
var facebook_app_access = "";
var generateToken = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
var createAccesstoken = function (timeToLive, user, token, callback) {
    var ttl = 60, token;
    if (timeToLive) {
        ttl = timeToLive
    }
    //token = generateToken()
    var access = {token: token, user: user, ttl: ttl};
    var options = { upsert: true, new: true, setDefaultsOnInsert: true };
    accessToken.findOneAndUpdate({user: user}, access, options, function(err, data) {
        callback(err, data);
    })
}
var verifytoken = function (token, callback) {

    accessToken.findOne({token: token}, function(err, data) {
        if (!err && data) {
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
var init = function () {
    var appTokenUrl = 'https://graph.facebook.com/oauth/access_token?client_id=307608722910374&client_secret=6dec5610c25fa4cc814aa30c130d0a39&grant_type=client_credentials';
    request.get(appTokenUrl, function(err, data) {
        if (!err) {
            facebook_app_access = data.body;
            console.log('Got Access token ' + data.body);
        } else {
            console.error('error in getting access token');
        }
    });
}();
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
    addUser = function(req, res) {
        var userObj = {
            fbId : req.body.id,
            name : req.body.name,
            picture : req.body.picture,
            email : req.body.email,
            phone : req.body.phone,
            gender : req.body.gender
        };
        var options = { upsert: true, new: true, setDefaultsOnInsert: true };
        User.findOneAndUpdate({email: userObj.email}, userObj, options, function(err, user) {
            if (!err) {
                createAccesstoken(undefined, req.body.email, req.body.accessToken, function(accessErr, data) {
                    if(!accessErr) {
                        console.log('user created ' + userObj.email)
                        res.status(200).send({'user': userObj.email});
                    } else {
                        console.error(JSON.stringify(accessErr))
                        res.status(500).send();
                    }
                });
            } else {
                console.error(JSON.stringify(err))
                res.status(500).send();
            }
        });
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
    verifyFaceToken = function(req, res) {
        if (!req.body.authResponse) {
            res.status(400).send();
            return;
        }
        var authResp = req.body.authResponse;        
        var url = 'https://graph.facebook.com/debug_token?input_token='+authResp.accessToken+'&'+facebook_app_access;
        console.log(url);
        request.get(url, function(checkErr, checkData) {
            if (!checkErr) {
                var body = checkData.body
                body = JSON.parse(body);
                if (body.data && body.data.is_valid && authResp.userID===body.data.user_id) {
                    User.findOne({fbId: authResp.userID}, function(userErr, userData){
                        if (!userErr && userData) {
                            createAccesstoken(undefined, authResp.userID, authResp.accessToken, function(err, data) {
                                if(!err) {
                                    res.status(200).send({user: '/user/' + authResp.userID});
                                } else {
                                    res.status(500).send();
                                }
                            }) ;    
                        } else {
                            res.status(404).send();
                        }
                    });
                } else {
                    res.status(401).send();
                }
            } else {
                console.error(checkErr);
                res.status(500).send();
            }
        });
    };
    logout = function (req, res) {};
    var starPost = function (req, res) {
        var postId = req.body.postId,
            userId = req.params.id;
        User.findByIdAndUpdate(userId, {$push: {stars: postId}}, function(strErr, strData) {
            if (!strErr) {
                res.status(200).send();
            } else {
                console.error(strErr);
                res.status(500).send({err: strErr});
            }
        });   
    };
    var getUserDetail = function (req, res) {
        var id = req.params.id;
        User.findById(id, function (err, data) {
            if (!err && data) {
                res.status(200).send(data);
            } else {
                if (!err) {
                    res.status(404).send();
                } else {
                    res.status(500).send();
                }
            }
        });
    }
    return {
        register: register,
        login: login,
        updatePassword: updatePassword,
        verifyUser: verifyUser,
        verifyFaceToken: verifyFaceToken,
        addUser: addUser,
        starPost: starPost,
        getUserDetail: getUserDetail
    }
}

module.exports = routes();

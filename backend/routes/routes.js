var User = require('../models/user.js');
var Contexts = require('../models/contexts.js');
var langs = require('../models/langs.js');
var Group = require('../models/group.js');
var feedback = require('../models/feedback.js');
var accessToken = require('../models/accessToken.js');
var mailer = require('../utils/mailer');
var bcrypt = require('bcrypt');
var request = require('request');
var logger = require('../utils/logger');
var facebook_app_access = "";
var fs = require('fs');
var uuid = require('uuid');
var path = require('path');
var gm = require('gm').subClass({imageMagick: true});
const profImageUploadPath = __dirname + '/../assets/profile/';
var getIp = function (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
}
let validateEmail = (emailField) => {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (reg.test(emailField) == false)
        {
            return false;
        }
        return true;
}
var generateToken = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
var createAccesstoken = function (timeToLive, user, email, type, token, callback) {
    var ttl = 60;
    if (timeToLive) {
        ttl = timeToLive
    }
    if (!token) {
        token = generateToken()
    }
    var access = {token: token, user: user, ttl: ttl ,email:email, type: type};
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
let saveThumb = function (fileName) {
    return new Promise((resolve, reject)=> {
        gm(profImageUploadPath+fileName)
       .setFormat('jpg')
       .resize('20')
       .gravity('Center')
       .write(profImageUploadPath+'thumb/'+fileName, function (err) {
            if (!err) {
                console.log('Created thumbile for filename')
                resolve(profImageUploadPath+'thumb/'+fileName);
            } else {
                console.error('could not resize '+ profImageUploadPath+fileName, err);
                reject();
            }
        });
    })
}
let uploadProfPic = (data) => {
    return new Promise((resolve, reject)=> {
        if (data) {
            var filename = uuid.v1();
            var fileLoc = profImageUploadPath + filename;
            var size = undefined;
            data = data.replace(/^data:image\/png;base64,/,'')
            data = new Buffer(data,'base64')
            gm(data)
            .setFormat('jpg')
            .resize('150')
            .write(fileLoc + '.jpg', function(err){
                if (!err) {
                    saveThumb(filename+'.jpg')
                    .then((thumbLoc)=> {
                        console.log('Upload prfpic completed')
                        resolve(filename+'.jpg')
                    })
                    .catch((err)=> {
                        reject(err);
                    })
                } else {
                    reject(err)
                }
            })
         } else {
            resolve(false);
         }
    })
}
var routes = function () {
    register = function (req, res) {
        let email = req.body.email,
            password = req.body.password,
            phone = req.body.phone,
            name = req.body.name,
            picture = req.body.picture || undefined;
        if (req.body.email && req.body.password) {
            var verification = generateToken();
             bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(req.body.password, salt, function(err, hash) {
                    uploadProfPic(picture)
                    .then((picturePath)=> {
                        let userDetails = {'email': req.body.email, password: hash, type: 'user', 'verification': verification, 'phone': phone, name : name};
                        if (picturePath) {
                            userDetails.picture = {full :'/prof/'+picturePath, thumb: '/prof/thumb/'+picturePath};
                        }
                        let user = new User(userDetails);
                        console.log(JSON.stringify(user));
                        user.save(function(err, userData) {
                            if(!err) {
                                mailer(req.body.email, verification, name, function(mailerr) {
                                    if (!mailerr) {
                                        console.log("Mail send successfully");
                                        res.status(200).send(JSON.stringify({user: userData}));
                                    } else {
                                        console.error("Mail sending error", mailerr);
                                        res.status(500).send({err: 'Mail Err'});
                                   }
                                });
                                
                                /*createAccesstoken(undefined, userData.id, userData.email, userData.type, undefined, function (token) {
                                    delete userData.password;
                                    res.status(200).send(JSON.stringify({token: token, user: userData}));
                                });*/
                            } else {
                                console.error('Saving Failed' + JSON.stringify(err));
                                res.status(500).send({err: 'Could not save user'});
                            }
                        });
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
                    if (userData.status && userData.status !== "inactive") {
                        if (bcrypt.compareSync(password, userData.password)) {
                            createAccesstoken(undefined, userData._id, userData.email, userData.type, undefined, function (err, token) {
                                if (!err) {
                                    delete userData.password;
                                    delete userData.verification
                                    console.log(userData);
                                    res.status(200).send(JSON.stringify({token: token.token, user: userData}));
                                } else {
                                    res.status(401).send({err: 'Could not generate token'});
                                }
                            });
                        } else {
                            res.status(401).send({err: "Invalid Credentials"})
                        }
                    } else {
                        res.status(401).send({err: "User not active"})
                    }
                } else {
                    res.status(404).send({err:"User Not Found"})
                }
            }).lean();
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
        var code = req.query.code,
            email = req.query.email;
        User.findOneAndUpdate({email: email, verification: code}, {'$set': {status:'active'}}, {new: true, fields: 'name'}, function (err, data) {
            if (!err) {
                console.log('data', data);
                 res.render("verify", {data: data.name});
            } else {
                console.error(err);
                res.status(404).send({err: 'User not found'});
            }
        });
    };
    deleteToken = (req, res) => {
        let token = req.params.token
        accessToken.remove({token: token}, function(err, data) {
            if (!err) {
                console.log('[LOGOUT] ', token);
                res.status(204).send();
            } else {
                console.err('[LOGOUT] ', token, err);
                res.status(500).send();
            }
        })
    }
    logout = function (req, res) {};
    var getUserDetail = function (req, res) {
        let id = req.params.id;
        let filters = {}
        let isShort = req.query.short === 'true' ? true : false;
        if (isShort) {
            filters.username = 1;
            filters.profile_img = 1;
        }
        User.findById(id, filters, function (err, data) {
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
    };
    let getUserShortDetails = (req, res) => {
        let users = req.body.users;
        User.find({_id: {$in:users}}, {name:1, picture:1}, function (err, data) {
        console.log(data);
            if (!err && Array.isArray(data) && data.length > 0) {
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
    updateUser = function (req, res) {
        var userId = req.params.id,
            updateFields = {};
        if (req.body.name) {
            updateFields.name = req.body.name;
        }
        if (req.body.picture) {
            updateFields.picture = req.body.picture;
        }
        if (req.body.phone) {
            updateFields.phone = req.body.phone;
        }
        if (Array.isArray(req.body.stars)) {
            updateFields.stars = req.body.stars;
        }
        if (userId) {
            User.findByIdAndUpdate(userId, {$set:updateFields}, {new: true}, function (err, data) {
                if (!err) {
                    console.log('updated useruser', userId)
                    res.status(200).send(data);
                } else {
                    console.error('Error in updating user ' + userId, err)
                    res.status(500).send();
                }
            })
        } else {
            res.status(400).send({err: 'invalid_params'});
        }
    };
    listGroups = function (req, res) {
        console.log('[list groups]')
        Group.find({}, function(grpErr, grpData) {
            if (!grpErr) {
                console.log('[list groups] listed ', grpData.length, ' groups');
                res.status(200).send(grpData);
            } else {
                console.error('[list groups]', grpErr);
                res.status(500).send({err: grpErr});
            }
        });
    };
    listContexts = function (req, res) {
        console.log('[list contexts]');
        Contexts.findById('contexts', function(contErr, contData) {
            if (!contErr && contData) {
                console.log('[list groups] listed ', contData.contexts.length, ' contexts');
                res.status(200).send(contData.contexts);
            } else {
                if (contErr) {
                    console.error('[list contexts]', contErr);
                    res.status(500).send({err: contErr});
                } else {
                    console.error('[list contexts] not found');
                    res.status(404).send({err: 'not found'});
                }
            }
        });
    };
    listLanguages = function (req, res) {
        console.log('[list languages]');
        langs.findById('langs', function(langErr, langData) {
            if (!langErr && langData) {
                console.log('[list groups] listed ', langData.langs.length, ' langs');
                res.status(200).send(langData.langs);
            } else {
                if (langErr) {
                    console.error('[list langs]', langErr);
                    res.status(500).send({err: langErr});
                } else {
                    console.error('[list langs] not found');
                    res.status(404).send({err: 'not found'});
                }
            }
        });
    };

    addContext = function (req, res) {
        var contexts = req.body.contexts;
        console.log('[add contexts]')
        Contexts.updateById('contexts', {contexts: contexts}, function (updErr, updData) {
            if (!updErr) {
                console.log('[add groups] total ', contexts.length, ' contexts');
                res.status(240).send();
            } else {
                console.error('update context', updErr);
                res.status(500).send({err: updErr});
            }
        });
    };
    addLanguage = function (req, res) {
        var langs = req.body.langs;
        console.log('[add language]')
        langs.updateById('languages', {langs: langs}, function (updErr, updData) {
            if (!updErr) {
                console.log('[add groups] total ', langs.length, ' contexts');
                res.status(240).send();
            } else {
                console.error('update context', updErr);
                res.status(500).send({err: updErr});
            }
        });
    };
    let getUserCount = (req, res) => {
        User.count({}).exec()
        .then((count) => {
            res.status(200).send({"count": count})
        })
        .catch((err)=> {
            console.error(err);
            res.status(500).send({err:"Internal Server Error"})
        })
    };
    let addFeedback = (req, res) => {
        let email = req.body.email,
            name = req.body.name,
            phone = req.body.phone,
            message = req.body.message;
            msgCharLim = 1000;
        if (email && name && message && message.length < msgCharLim && validateEmail(email)) {
            let feed = new feedback({email:email, name:name, phone:phone, message:message})
            feed.save()
            .then((resp) => {
                console.log('[feedback] saved ', resp)
                res.status(204).send()
            })
            .catch((err) => {
                console.error('[feedback] error in saving ', err);
                res.status(500).send({err: 'Internal Server Error'})
            })
        } else {
            console.error("required params missing ", req.body);
            res.status(400).send({err: 'bad request'})
        }
    };
   return {
        register: register,
        login: login,
        updatePassword: updatePassword,
        verifyUser: verifyUser,
        getUserDetail: getUserDetail,
        getUserShortDetails: getUserShortDetails,
        updateUser: updateUser,
        listContexts: listContexts,
        listGroups: listGroups,
        deleteToken: deleteToken,
        addContext: addContext,
        listLanguages: listLanguages,
        getUserCount: getUserCount,
        addFeedback:addFeedback

    }
}

module.exports = routes();

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
var gm = require('gm');
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
/*
var init = function () {
    //production
    //var appTokenUrl = 'https://graph.facebook.com/oauth/access_token?client_id=307608189577094&client_secret=abbe305279c252a30352d4c2591a5360&grant_type=client_credentials';
    //dev
    var appTokenUrl = 'https://graph.facebook.com/oauth/access_token?client_id=307608722910374&client_secret=6dec5610c25fa4cc814aa30c130d0a39&grant_type=client_credentials';
    request.get(appTokenUrl, function(err, data) {
        if (!err) {
            facebook_app_access = JSON.parse(data.body).access_token;
            console.log('Got Access token ' + facebook_app_access);
        } else {
            console.error('error in getting access token');
        }
    });
}();*/
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
            picture = req.body.picture;
        if (req.body.email && req.body.password) {
            var verification = generateToken();
             bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(req.body.password, salt, function(err, hash) {
                    uploadProfPic(picture.image)
                    .then((picturePath)=> {
                        let userDetails = {'email': req.body.email, password: hash, type: 'user', 'verification': verification, 'phone': phone};
                        if (picturePath) {
                            userDetails.picture = {full :'/prof/'+picturePath, thumb: '/prof/thumb/'+picturePath};
                        }                        
                        let user = new User(userDetails);
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
                                res.status(200).send(JSON.stringify({user: userData}));
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
    /*
    addUser = function(req, res) {
        var userObj = {
            fbId : req.body.fbId,
            name : req.body.name,
            email : req.body.email,
            phone : req.body.phone,
            gender : req.body.gender,
            type: 'user'
        };
        var options = { upsert: true, new: true, setDefaultsOnInsert: true };
        var updMatch = {};
        var downloadImage = function(uri, filename, callback){
          request.head(uri, function(err, res, body){
            console.log('content-type:', res.headers['content-type']);
            console.log('content-length:', res.headers['content-length']);
            console.log(filename);
            request(uri)
            .on('error', function(err) { console.error('error in uploda', err)})
            .pipe(fs.createWriteStream(filename))
            .on('close', callback)            
          });
        };
        downloadImage(req.body.picture, profImageUploadPath+req.body.fbId+'.jpg', function(err, data){
                console.log('prof image creations', err, data)        
            userObj.picture = '/images/profile/thumb/'+req.body.fbId+'.jpg';
            if (userObj.email) {
                updMatch = {email: userObj.email}
            } else {
                updMatch = {fbId: userObj.fbId}
            }
            User.findOneAndUpdate(updMatch, userObj, options, function(err, user) {
                if (!err) {
                    if (userObj.email) { 
                        createAccesstoken(undefined, user._id, req.body.email, user.type, req.body.accessToken, function(accessErr, data) {
                            if(!accessErr) {
                                console.log('user created ', JSON.stringify(data));
                                res.status(200).send({user: user, token: data});
                            } else {
                                console.error(JSON.stringify(accessErr))
                                res.status(500).send();
                            }                            
                        });
                    } else {
                        res.status(400).send();
                    }
                } else {
                    console.error(JSON.stringify(err))
                    res.status(500).send();
                }
            });
        })
    };*/
    login = function (req, res) {
            var email,
            password;
        if (req.body.email && req.body.password) {
            email = req.body.email;
            password = req.body.password;
            User.findOne({email:email}, function(userErr, userData) {
                if (!userErr && userData) {
                    console.log(userData);
                    if (userData.status && userData.status !== "inactive") {
                        if (bcrypt.compareSync(password, userData.password)) {
                            createAccesstoken(undefined, userData._id, userData.email, userData.type, undefined, function (err, token) {
                                if (!err) {
                                    delete userData.password;
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
                createAccesstoken(undefined, data._id, data.email, data.type, undefined, function (token) {
                    delete userData.password;
                    res.status(200).send(JSON.stringify({token: token.token, user: data}));
                });
            } else {
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
    /*
    verifyFaceToken = function(req, res) {
        if (!req.body.authResponse) {
            res.status(400).send();
            return;
        }
        var authResp = req.body.authResponse;
        var url = 'https://graph.facebook.com/debug_token?input_token='+authResp.accessToken + '&access_token='+facebook_app_access;
        logger.log(1, 'verify fb token', 'Verifying FB token ', 'route.js', getIp(req), url)
        request.get(url, function(checkErr, checkData) {
            if (!checkErr) {
                var body = checkData.body
                body = JSON.parse(body);
                if (body.data && body.data.is_valid && authResp.userID===body.data.user_id) {
                    logger.log(1, 'verify fb token', 'Got user verified from FB ', 'route.js', getIp(req), undefined)
                    User.findOne({fbId: authResp.userID}, function(userErr, userData){
                        if (!userErr && userData && userData.email) {
                            logger.log(1, 'verify fb token', 'Found user in db ', 'route.js', getIp(req), userData)
                            createAccesstoken(undefined, userData._id, userData.email, userData.type, authResp.accessToken, function(err, data) {
                                if(!err) {
                                    logger.log(1, 'verify fb token', 'Access token created after verification ', 'route.js', getIp(req), data)
                                    res.status(200).send({user: '/user/' + userData._id});
                                } else {
                                    logger.log(3, 'verify fb token', 'Could not create access token ', 'route.js', getIp(req), err)
                                    res.status(500).send();
                                }
                            }) ;    
                        } else {
                            logger.log(3, 'verify fb token', 'Error in fiding user in DB ', 'route.js', getIp(req), {err: checkErr, data: userData})
                            res.status(404).send();
                        }
                    });
                } else {
                    logger.log(3, 'verify fb token', 'Facebook validation negative', 'route.js', getIp(req), body)
                    res.status(401).send();
                }
            } else {
                logger.log(3, 'verify fb token', 'Facebook validation failed', 'route.js', getIp(req), checkErr)
                res.status(500).send();
            }
        });
    };*/
    logout = function (req, res) {};
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
        var contexts = req. body.contexts;
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
        var langs = req. body.langs;
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
 //       verifyFaceToken: verifyFaceToken,
 //       addUser: addUser,
        getUserDetail: getUserDetail,
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

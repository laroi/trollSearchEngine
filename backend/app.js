var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var http = require('http');
var methodOverride = require('method-override');
var route = require('./routes/routes');
var postRoute = require('./routes/postRout');
var app = express();
var access = require('./models/accessToken');
var contexts = require('./models/contexts');
var server = http.createServer(app);
var multer  = require('multer');
var logger = require('./utils/logger');
const path = require('path');

/*var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        var fileName = uuid.v1();
        fileName += path.extname(file.originalname)
        file.renamed = fileName
        cb(null, fileName);
    }
});*/
var fileFilter = function (req, file, cb) {
    var fileTypes = ['.jpg', '.jpeg', '.png', '.html'];
    var ext = path.extname(file.originalname);
    if (fileTypes.indexOf(ext) > -1) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
//var upload = multer({ storage: storage, fileFilter: fileFilter })
// connect to Mongo when the app initializes
mongoose.connect('mongodb://localhost:27017/trolls');

  app.use(bodyParser({limit: '10mb'}));
  app.use(bodyParser.json())
  app.use(methodOverride());

// set up the RESTful API, handler methods are defined in api.js

//app.post('/thread', api.post);
//app.get('/thread/:title/:format', api.show);
//app.get('/thread', api.list);

whiteListedUsers = [];
blackListedUsers = [];
var getIp = function (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
}
var addDefaultContexts = function () {
    var context = { "_id" : "contexts", "contexts" : [  "pucham",  "shokam",  "shock",  "pling",  "kalipp", "thug life" ] };
    contexts.count({ "_id" : "contexts"}, function(err, cnt) {
        if (!err && cnt <1) {
            contexts.findOneAndUpdate({ "_id" : "contexts"}, context, {upsert: true}, function (err, data) {
                if (!err) {
                    logger.log(1, 'add context', 'added default context ', 'app.js', 'server', undefined);
                } else {
                    logger.log(3, 'add context', 'error in adding default context ', 'app.js', 'server', err);
                }
            })
        } else {
            logger.log(1, 'add context', 'context already exists', 'app.js', 'server', undefined);
        }
    })

}();
var isAuthenticated = function (admin) {

    return function(req, res, next) {      
        logger.log(1, 'auth', 'trying to authenticate for  ' + req.originalUrl + ' with token ', 'app.js', getIp(req), undefined)
        if (req.query.accessToken || req.headers['authorization']) {
            var tok = req.query.accessToken || req.headers['authorization'];
            access.findOne({token: tok}, function (err, data) {
                if (!err && data && blackListedUsers.indexOf(data.user) < 0) {
                        if (data.type === 'admin') {
                            req.isAdmin = true;
                            logger.log(1, 'auth admin', 'Admin authenticated admin ' + data.user + ' with token ' + tok, 'app.js', getIp(req), undefined)                                   
                            next();
                        } else {
                            logger.log(3, 'auth admin', 'could not authenticate user ' + data.user + ' as admin with token' + tok, 'app.js', getIp(req), undefined)
                            res.status(401).send({err:'unauthorized'});
                        }                    
                    return;
                } else {
                    logger.log(3, 'auth', 'could not authenticate user ' + (data ? data.user : '')+ ' with token' + tok, 'app.js', getIp(req), err)
                    res.status(401).send({err:'unauthorized'});
                    //next();
                    return;
                }
            });
        } else {
            logger.log(3, 'auth', 'could not authenticate user, no token provided ', 'app.js', getIp(req), undefined)
            res.status(403).send({err:'forbidden'});
            //next();
        }
    }
}

// This auth for list api to filter out non admins
var listAuth = function (req, res, next) {
    // checking token and see if request to list unapproved posts, if not, pass directly
    if ((req.query.accessToken || req.headers['authorization']) && (req.body.isApproved === "false")) {
    var tok = req.query.accessToken || req.headers['authorization'];
        access.findOne({token: tok}, function (err, data) {
            if (!err && data && blackListedUsers.indexOf(data.user) < 0) {
                    if (data.type === 'admin') {
                        req.isAdmin = true;
                        logger.log(1, 'auth admin', 'Admin authenticated admin ' + data.user + ' with token ' + tok, 'app.js', getIp(req), undefined)                                   
                        next();
                    } else {
                        logger.log(3, 'auth admin', 'could not authenticate user ' + data.user + ' as admin with token' + tok, 'app.js', getIp(req), undefined)
                        req.body.isFavorite = false;
                        next();
                    }
                }
        })
    } else {
        next();
    }
}
if (!Array.prototype.find) {
  Array.prototype.find = function (callback, thisArg) {
    "use strict";
    var arr = this,
        arrLen = arr.length,
        i;
    for (i = 0; i < arrLen; i += 1) {
        if (callback.call(thisArg, arr[i], i, arr)) {
            return arr[i];
        }
    }
    return undefined;
  };
}
app.use('/images', express.static(__dirname + '/assets/uploads'));
app.use('/images/profile', express.static(__dirname + '/assets/profile'));
app.post('/login', route.login);
app.post('/token', route.verifyFaceToken);
app.delete('/token/:token', route.deleteToken);
app.post('/user', route.addUser);
app.put('/user', isAuthenticated(false), route.updatePassword);
app.put('/user/:id', isAuthenticated(false), route.updateUser);
app.get('/user/:id', isAuthenticated(false), route.getUserDetail);
app.get('/groups', route.listGroups);
app.get('/contexts', route.listContexts);
app.get('/langs', route.listLanguages);
app.get('/test', postRoute.test)
app.post('/posts', listAuth, postRoute.getPosts);
app.get('/post/:id', postRoute.getPost);
app.delete('/post/:id', isAuthenticated(), postRoute.deletePost);
app.put('/post/:id', isAuthenticated(false), postRoute.updatePost);
app.put('/post/:id/comment', isAuthenticated(false), postRoute.updateComment);
app.put('/post/:id/like', isAuthenticated(false), postRoute.updateLike);
app.put('/post/:id/unlike', isAuthenticated(false), postRoute.unLike);
app.post('/request', isAuthenticated(false), postRoute.requestMeme)
app.post('/post', isAuthenticated(false), postRoute.post)
app.get('/image/:id', postRoute.downloadImage);
app.get('/suggestions', postRoute.autoSuggestion);
app.listen(4001);
console.log("Express server listening on port 4001");

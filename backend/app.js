var express = require('express');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var bodyParser = require('body-parser');
var http = require('http');
var methodOverride = require('method-override');
var route = require('./routes/routes');
var postRoute = require('./routes/postRout');
var app = express();
var access = require('./models/accessToken');
var contexts = require('./models/contexts');
var langs = require('./models/langs.js');
var server = http.createServer(app);
var multer  = require('multer');
const config = require('./config.js');
var logger = require('./utils/logger');
const path = require('path');
var uuid = require('uuid');
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
const trollsUploadPath = __dirname + '/assets/trolls/';
const identifyUploadPath = __dirname + '/assets/identify/';
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, trollsUploadPath)
    },
    filename: function (req, file, cb) {
        var fileName = uuid.v1();
        fileName += path.extname(file.originalname)
        file.renamed = fileName
        console.log(trollsUploadPath, fileName)
        cb(null, fileName);
    }
});
const modifyPath = (req, res, next) => {
    console.log(req.file)
    req.file.relativePath = `/identify/images/${req.file.renamed}`;
    next()
}
var identifyStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, identifyUploadPath)
    },
    filename: function (req, file, cb) {
        var fileName = uuid.v1();
        fileName += path.extname(file.originalname)
        file.renamed = fileName
        console.log(identifyUploadPath, fileName)
        cb(null, fileName);
    }
});

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
const upload = multer({ storage:storage })
const uploadIdentify = multer({ storage:identifyStorage })

mongoose.connect(`mongodb://${config.mongoHost}:${config.mongoPort}/trolls`);

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

var addDefaultLangs = function () {
    var languages = { "_id" : "langs", "langs" : [  "malayalam",  "tamil",  "hindi",  "telugu",  "english" ] };
    langs.count({ "_id" : "langs"}, function(err, cnt) {
        if (!err && cnt <1) {
            langs.findOneAndUpdate({ "_id" : "langs"}, languages, {upsert: true}, function (err, data) {
                if (!err) {
                    logger.log(1, 'add langs', 'added default languages ', 'app.js', 'server', undefined);
                } else {
                    logger.log(3, 'add langs', 'error in adding default languages ', 'app.js', 'server', err);
                }
            })
        } else {
            logger.log(1, 'add langs', 'language already exists', 'app.js', 'server', undefined);
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
                            }
                        if (data.isPermenant) {
                            req.isPermenant = true
                        }
                            req.userId = data.user;
                            logger.log(1, 'auth', ' authenticated user ' + data.user + ' with token ' + tok, 'app.js', getIp(req), undefined)                                   
                            next();
                        /*} else {
                            logger.log(3, 'auth admin', 'could not authenticate user ' + data.user + ' as admin with token' + tok, 'app.js', getIp(req), undefined)
                            res.status(401).send({err:'unauthorized'});
                        } */                   
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
    if ((req.query.accessToken || req.headers['authorization']) && ((req.body.isApproved === false) || (req.body.isFavorite === true))) {
    var tok = req.query.accessToken || req.headers['authorization'];
        access.findOne({token: tok}, function (err, data) {
            if (!err && data && blackListedUsers.indexOf(data.user) < 0) {
                    req.user = data.user;
                    if (data.type === 'admin') {
                        req.isAdmin = true;
                        logger.log(1, 'auth admin', 'Admin authenticated admin ' + data.user + ' with token ' + tok, 'app.js', getIp(req), undefined)                                   
                        next();
                    } else {
                        logger.log(3, 'auth admin', 'could not authenticate user ' + data.user + ' as admin with token' + tok, 'app.js', getIp(req), undefined)
                        //req.body.isFavorite = false;
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
/*
Static Routes
*/

app.use('/images', express.static(__dirname + '/assets/uploads'));
app.use('/requests/images', express.static(__dirname + '/assets/requests'));
app.use('/identify/images', express.static(__dirname + '/assets/identify'));
app.use('/images/profile', express.static(__dirname + '/assets/profile'));
app.use('/images/sample_prof', express.static(__dirname + '/assets/sample_prof'));

/* User Routes */
app.post('/token', route.login);
app.delete('/token/:token', route.deleteToken);
app.post('/user', route.register);
app.get('/user/verification', route.verifyUser);
app.get('/user/count', route.getUserCount);
app.put('/user', isAuthenticated(false), route.updatePassword);
app.put('/user/:id', isAuthenticated(false), route.updateUser);
app.put('/user/:userId/favorite/:postId', isAuthenticated(false), route.addToFav);
app.delete('/user/:userId/favorite/:postId', isAuthenticated(false), route.removeFromFav);
app.get('/user/:userId/favorite', isAuthenticated(false), route.listFavorite)
app.get('/user/:id', isAuthenticated(false), route.getUserDetail);
app.post('/users', route.getUserShortDetails);

/*Master Data*/
app.post('/feedback', route.addFeedback);
app.get('/groups', route.listGroups);
app.get('/contexts', route.listContexts);
app.get('/langs', route.listLanguages);
app.get('/randomuser', route.getRandomUser);

/*Health Check*/
app.get('/test', postRoute.test)

/*Requests*/
app.get('/requests', postRoute.getRequests);
app.get('/request/:id', postRoute.getRequest);
app.delete('/request/:id', isAuthenticated(), postRoute.deleteRequest);

app.post('/request', postRoute.requestMeme);
app.put('/request/:id/comment', postRoute.addComment);
app.put('/request/:id', isAuthenticated(false), postRoute.updateRequest);

/*Post Routes*/
app.post('/posts', listAuth, postRoute.getPosts);
app.post('/updatedposts', listAuth, postRoute.getUpdatePosts);
app.get('/post/:id', postRoute.getPost);
app.delete('/post/:id', isAuthenticated(), postRoute.deletePost);
app.put('/post/:id', isAuthenticated(false), postRoute.updatePost);
app.put('/post/:id/comment', isAuthenticated(false), postRoute.updateComment);
app.put('/post/:id/like', isAuthenticated(false), postRoute.updateLike);
app.put('/post/:id/unlike', isAuthenticated(false), postRoute.unLike);
app.post('/post', isAuthenticated(false), postRoute.post)
app.get('/image/:id', postRoute.downloadImage);
app.get('/suggestions', postRoute.autoSuggestion);
app.get('/incrementviews', postRoute.incrementViews);
app.post('/troll/:id', upload.single('troll'), postRoute.addTroll)

/* Insights */
app.post('/insight', postRoute.updateInsight)
app.get('/insight', postRoute.getInsight)

/* Identify */

/*
 listIdentify:listIdentify,
        getIdentify:getIdentify,
        addCommentIdentify:addCommentIdentify,
        resolveIdentify: resolveIdentify,
        addIdentify: addIdentify,
*/
app.get('/identify', postRoute.listIdentify)
app.get('/identify/random', postRoute.getRandomIdentify)
app.get('/identify/:id', postRoute.getIdentify)
app.post('/identify/:id/comment', postRoute.addCommentIdentify)
app.post('/identify/:id/resolve',isAuthenticated(), postRoute.resolveIdentify)
app.post('/identify', uploadIdentify.single('identify'), modifyPath, postRoute.addIdentify)


app.listen(config.appPort);
console.log(`Express server listening on port ${config.appPort}`);


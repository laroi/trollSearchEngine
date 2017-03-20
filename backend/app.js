var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var http = require('http');
var methodOverride = require('method-override');
var route = require('./routes/routes');
var postRoute = require('./routes/postRout');
var app = express();
var access = require('./models/accessToken')
var server = http.createServer(app);
var multer  = require('multer');

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
function isAuthenticated(req, res, next) {
    if (req.query.accessToken || req.headers['Authorization']) {
        var tok = req.query.accessToken || req.headers['Authorization'];
        access.findOne({token: req.query.accessToken}, function(err, data) {
            if (!err) {
                console.log('authenticated');
                next();
                return;
            } else {
                console.log('access token not found');
                res.redirect('/');
                return;
            }
        });
    } else {
        console.log('access token not provided');
        //res.redirect('/');
        next();
    }
}

app.use('/images', express.static(__dirname + '/uploads'));
app.post('/login', route.login);
app.post('/token', route.verifyFaceToken);
app.post('/user', route.addUser);
app.put('/user', isAuthenticated, route.updatePassword);
app.put('/user/:id/star', isAuthenticated, route.starPost);
app.get('/user/:id', isAuthenticated, getUserDetail)
app.get('/test', postRoute.test)
app.post('/posts', postRoute.getPosts);
app.get('/post/:id', postRoute.getPost);
app.put('/post/:id', isAuthenticated, postRoute.updatePost);
app.put('/post/:id/comment', isAuthenticated, postRoute.updateComment);
app.put('/post/:id/like', isAuthenticated, postRoute.updateLike);
app.post('/post', postRoute.post)
app.get('/image/:id', postRoute.downloadImage);
app.get('/suggestions', postRoute.autoSuggestion);
app.listen(3000);
console.log("Express server listening on port 3000");

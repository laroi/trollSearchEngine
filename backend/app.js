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

  app.use(bodyParser());
  app.use(methodOverride());

// set up the RESTful API, handler methods are defined in api.js

//app.post('/thread', api.post);
//app.get('/thread/:title/:format', api.show);
//app.get('/thread', api.list);
function isAuthenticated(req, res, next) {
    if (req.query.accessToken) {
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
        res.redirect('/');
    }
}

app.post('/login', route.login);
app.post('/token', route.verifyUser);
app.post('/user', route.register);
app.put('/user', isAuthenticated, route.updatePassword);
app.get('/test', postRoute.test)
app.post('/posts', postRoute.getPosts);
app.get('/post/:id', postRoute.getPost);
app.put('/post/:id', isAuthenticated, postRoute.updatePost)
app.post('/post', postRoute.post)
app.listen(3000);
console.log("Express server listening on port 3000");

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var http = require('http');
var methodOverride = require('method-override');
var route = require('./routes/routes');
var app = express();
var access = require('./models/accessToken')
var server = http.createServer(app);

// connect to Mongo when the app initializes
mongoose.connect('mongodb://localhost:27017/test');

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
                next();
            } else {
                res.redirect('/');
            }
        });
    }
    res.redirect('/');
}

app.post('/login', route.login);
app.post('/token', route.verifyUser);
app.post('/user', route.register);
app.put('/user', isAuthenticated, route.updatePassword);
app.listen(3000);
console.log("Express server listening on port 3000");

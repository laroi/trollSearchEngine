var User = require('../models/user.js');
var Post = require('../models/post.js');
var generateToken = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
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
    
    };
    forgotPassword = function (req, res) {};
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

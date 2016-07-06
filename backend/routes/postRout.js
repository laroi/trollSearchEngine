var Post = require('../models/post.js');
var elastic = require('../utils/elastic');
var routes = function () {
    var test = function (req, res) {
        elastic.init();
        res.status(200).send();
    }
    return { 
        test: test
    }
}

module.exports = routes();

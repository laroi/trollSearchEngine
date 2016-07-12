var Post = require('../models/post.js');
var elastic = require('../utils/elastic');

var routes = function () {
    var test = function (req, res) {
        elastic.init();
        res.status(200).send();
    }
    post = function(req, res) {
        var userId = req.body.userId,
            title = req.body.title,
            type = req.body.type,
            description = req.body.description,
            imageUrl = req.file.path,
            tags = req.body.tags,
            movie = req.body.movie,
            characters = req.body.characters
            actors = req.body.actors,
            event = req.body.event,
            obj = {},
            postObj;
        if (req.file && req.body.userId && req.body.type) {
            obj.userId = userId;
            obj.title = title;
            obj.type = type;
            obj.description = description;
            obj.imageUrl = imageUrl;
            obj.tags = tags;
            obj.movie = movie;
            obj.actors = actors;
            obj.characters = characters;
            obj.event = event;
            postObj = new Post(obj);
            postObj.save(function(saveErr, saveData) {
                if (!saveErr) {
                    res.status(201).send(saveData);
                } else {
                    res.status(500).send({err: 'Could not save post'});
                }
            });
        } else {
            res.status(400).send({err: 'Bad Parameter'});
        }
    }
    return { 
        test: test,
        post: post
    }
}

module.exports = routes();

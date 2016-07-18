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
            characters = req.body.characters,
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
                    elastic.putDoc(obj, function(err, data) {
                        if(!err) {
                            res.status(201).send(saveData);
                        } else {
                            res.status(500).send({err: 'Could not save post'});
                        }
                    });                
                } else {
                    res.status(500).send({err: 'Could not save post'});
                }
            });
        } else {
            res.status(400).send({err: 'Bad Parameter'});
        }
    }
    getPosts = function (req, res) {
        var title = req.body.title,
            type = req.body.type,
            userId = req.body.userId,
            tags = req.body.tags,
            movie = req.body.movie,
            characters = req.body.characters,
            actors = req.body.actors,
            search = req.body.search,
            event = req.body.event,
            opts = {};
            if (search) {
                opts.search = search;
            } else {
                opts.title = title;
                opts.userId = userId;
                opts.tags = tags;
                opts.movie = movie;
                opts.characters = characters;
                opts.actors = actors;
                opts.event = event;
            }
            opts.type = type;
        elastic.getDocs(opts, function(err, data) {
            if (!err) {
                res.status(200).send(data)
            } else {
                console.error(JSON.stringify(err));
                res.status(500).send({'errr': 'could not get data'})
            }
        })
    }
    getPost = function (req, res) {
        var id = req.params.id
        if (id) {
            Post.find({_id: id}, function(err, data) {
                if (!err) {
                    res.status(200).send(JSON.stringify(data));
                } else {
                    console.error(JSON.stringify(err));
                    res.status(500).send(err)
                }
            });
        } else {
            res.status(400).send({err: 'bad request'})
        }        
    }
    return { 
        test: test,
        post: post,
        getPost: getPost,
        getPosts: getPosts
    }
}

module.exports = routes();

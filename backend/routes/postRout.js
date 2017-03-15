var Post = require('../models/post.js');
var elastic = require('../utils/elastic');
var uploadPath = __dirname + '/../uploads/';
var uuid = require('uuid');
var fs = require('fs');
var path = require('path');
var access = require('../models/accessToken')
var saveFile = function(fileLoc, image, callback){
    if (image && fileLoc) {
        fs.writeFile(fileLoc, image.image, 'base64', function(fileErr) {
            if (!fileErr) {
                callback(undefined, fileLoc)
            } else {
                callback(filErr, undefined)
            }
        });
    } else {
        callback();
    }
}
var routes = function () {
    elastic.init();
    var test = function (req, res) {
        
        res.status(200).send();
    },
    isOwner = function (model, id, token, callback) {
        model.find({userId: id}, function(docErr, docData) {
            access.findOne({token: token}, function(err, data) {
                if (!err) {
                    if (data.user = docData.userId) {
                        console.log('ownership verified');
                        callback();
                        return;
                    } else {
                        console.log('failed to verify ownership');
                        //callback({err: 'failed to verify ownership'});
                        callback();
                        return;
                    }
                } else {
                    console.log('token not found');
                    //callback(err)
                    callback();
                    return;
                }
            });
        })
    },
    post = function(req, res) {
        var _id = req.body._id || undefined,
            userId = req.body.userId,
            title = req.body.title,
            type = req.body.type,
            isAdult = req.body.isAdult,
            description = req.body.description,
            tags = req.body.tags,
            movie = req.body.movie,
            language = req.body.language,
            characters = req.body.characters,
            actors = req.body.actors,
            event = req.body.event,
            createdAt = req.body.createdAt,
            lastModified = req.body.lastModified,
            obj = {},
            postObj;
        if (req.body.image && req.body.userId && req.body.type) {
            var filename = uuid.v1() + '.' + req.body.image.type
            var fileLoc = uploadPath + filename;
            fs.writeFile(fileLoc, req.body.image.image, 'base64', function(err) {
                if (!err) {
                    obj.userId = userId;
                    obj.title = title;
                    obj.type = type;
                    obj.isAdult = isAdult;
                    obj.description = description;
                    obj.tags = tags;
                    obj.movie = movie;
                    obj.image = {url: '/images/'+filename, type: req.body.image.type};
                    obj.language = language;
                    obj.actors = actors;
                    obj.characters = characters;
                    obj.event = event;
                    obj.createdAt = createdAt;
                    obj.lastModified = lastModified;
                    postObj = new Post(obj);
                    postObj.save(function(saveErr, saveData) {
                        if (!saveErr) {
                            console.log('Saved Post ' + saveData.id)
                            obj.id = saveData.id
                            elastic.putDoc(obj, function(err, data) {
                                if(!err) {
                                    res.status(201).send(saveData);
                                } else {
                                    console.error(JSON.stringify(err))
                                    res.status(500).send({err: 'Could not save post'});
                                }
                            });                
                        } else {
                            console.error(JSON.stringify(saveErr))
                            res.status(500).send({err: 'Could not save post'});
                        }
                    });
                } else {
                    console.log(err);
                    res.status(500).send({err: 'Could not save post'});
                }
            });
        } else {
            console.error('Params not provided');
            res.status(400).send({err: 'Bad Parameter'});
            return;
        }
    },
    getPosts = function (req, res) {
        var title = req.body.title,
            type = req.body.type,
            userId = req.body.userId,
            tags = req.body.tag,
            movie = req.body.movie,
            group = req.body.group,
            language = req.body.language,
            characters = req.body.character,
            actors = req.body.actor,
            search = req.body.search,
            event = req.body.event,
            from = req.body.from,
            order = req.body.order,
            isAdult = req.body.isAdult,
            opts = {};
            if (search) {
                opts.search = search;
            } else {
                opts.title = title;
                
                opts.tags = tags;
                opts.movie = movie;
                opts.characters = characters;
                opts.actors = actors;
                opts.event = event;
                
            }
            if (group) {
                opts.group = group;
            }
            if (type) {
                opts.type = type;
            }
            if (userId) {
                opts.userId = userId;
            }
            if (isAdult) {
                opts.isAdult = isAdult;
            }
            opts.from = from;
            opts.order = order;
        elastic.getDocs(opts, function(err, data) {
            if (!err) {
            console.log(JSON.stringify(data));
                res.status(200).send(data)
            } else {
                console.error(JSON.stringify(err));
                res.status(500).send({'errr': 'could not get data'})
            }
        })
    },
    getPost = function (req, res) {
        var id = req.params.id
        if (id) {
            Post.find({_id: id}, function(err, data) {
                if (!err) {
                    res.status(200).send(JSON.stringify(data));
                    Post.update({_id: id}, { $inc: {views:1}})
                    data.views = data.views+1;
                    elastic.update(id, data);
                } else {
                    console.error(JSON.stringify(err));
                    res.status(500).send(err)
                }
            });
        } else {
            res.status(400).send({err: 'bad request'})
        }        
    },
    updatePost = function (req, res) {
        isOwner(Post, req.body.userId, req.query.accessToken, function (err) {
            if (!err) {                
                var updateObj = {},
                doc = req.body,
                id = doc._id;
                if (req.body.userId && req.body.type) {
                if (req.body.image) {
                    var filename = req.body.image.name;
                    var fileLoc = uploadPath + filename;
                }
                saveFile(fileLoc, req.body.image, function(fileErr, imageLoc) {
                    if (!fileErr) {
                        if (doc.title) {
                            updateObj.title = doc.title
                        }
                        if (doc.type) {
                            updateObj.type = doc.type
                        }
                        if (doc.description) {
                            updateObj.description = doc.description
                        }
                        if (doc.tags) {
                            updateObj.tags = doc.tags
                        }
                        if (doc.movie) {
                            updateObj.movie = doc.movie
                        }
                        if (doc.language) {
                            updateObj.language = doc.language
                        }
                        if (doc.actors) {
                            updateObj.actors = doc.actors
                        }
                        if (doc.characters) {
                            updateObj.characters = doc.characters
                        }
                        if (doc.event) {
                            updateObj.event = doc.event
                        }
                        Post.update({_id: id}, {$set: updateObj}, function(err, numAffected) {
                            if (!err) {
                                console.log('Updated post ' + id + ' in database');
                                elastic.updateDoc(id, updateObj, function(err, data) {
                                    if(!err) {
                                        console.log('Updated post ' + id + ' in elasticsearch');
                                        res.status(200).send();
                                    } else {
                                        res.status(500).send({err: 'Could not save post'});
                                    }
                                });           
                            } else {
                                console.error('Could not update post', err);
                                res.status(500).send({'err':'Something went wrong'})
                            }
                        }) 
                    } else {
                        console.error('Could not update post', fileErr);
                        res.status(500).send({'err':'Something went wrong'})
                    }
                });
            }
        } else {
            console.error('Could not update post', err);
            res.status(401).send({'err':'Something went wrong'})
        }
    });
    },
    downloadImage = function (req, res){
        postId = req.params.id;
        Post.findById(postId, function(err, post){
            if (!err) {
                var fileName = post.image.url.split('/')[2]
                fs.stat(uploadPath+fileName, function(statErr, statData) {
                    if (!statErr) {
                        res.writeHead(200, {
                            'Content-Type': 'image/'+post.image.type,
                            'Content-Length': statData.size,
                            'Access-Control-Allow-Origin': '*',
                            'Content-Disposition': 'attachment; filename='+fileName
                        });
                        var readStream = fs.createReadStream(uploadPath+fileName);
                        readStream.pipe(res);
                        Post.update({_id: postId}, { $inc: {downloads:1}})
                        post.downloads = post.downloads+1;
                        elastic.updateDoc(postId, post);
                    } else {
                        console.error(JSON.stringify(statErr));
                        res.status(500).send();
                    }                
                })
                
            } else {
                console.error(JSON.stringify(err));
                res.status(500).send();
            }
        })
    },
    autoSuggestion = function (req, res) {
        var field = req.query.field,
        searchTerm = req.query.query;
        field = field ? field.split(',') : [];
        if (searchTerm) {
            elastic.getSuggestions({fields: field, query: searchTerm}, function(err, data) {
                if (!err) {
                    res.status(200).send(data.suggest)
                } else {
                    res.status(500).send(err)          
                }
            });
        } else {
            res.status(400).send({err: 'search term required'});
        }
    }
    
    
    return { 
        test: test,
        post: post,
        getPost: getPost,
        getPosts: getPosts,
        updatePost: updatePost,
        downloadImage: downloadImage,
        autoSuggestion: autoSuggestion
    }
}

module.exports = routes();

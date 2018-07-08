var Post = require('../models/post.js');
var Req = require('../models/request.js');
var elastic = require('../utils/elastic');
const uploadPath = __dirname + '/../assets/uploads/';
const reqUploadPath  = __dirname + '/../assets/requests/';
const waterkImg = __dirname + '/../assets/logo.png';
var uuid = require('uuid');
var fs = require('fs');
var path = require('path');
var gm = require('gm');
var ObjectID = require('mongodb').ObjectID;
var access = require('../models/accessToken');
var logger = require('../utils/logger');
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
var getIp = function (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
}
var routes = function () {
    elastic.init();
    var test = function (req, res) {        
        res.status(200).send();
    },
    isOwner = function (model, doc_id, token, callback) {
        model.findById(doc_id, function(docErr, docData) {
            if (!docErr && docData) {
                access.findOne({token: token}, function(err, data) {
                    if (!err && data) {
                        if (data.user = docData.user.id || data.type === 'admin') {
                            console.log('ownership verified ', data.type);
                            callback();
                        } else {
                            console.log('failed to verify ownership');
                            callback({err: 'failed to verify ownership'});
                            //callback();
                        }
                    } else {
                        console.log('token not found');
                        callback(err || 'token not found');
                        //callback();
                    }
                });
            } else {
                console.log('doc ' + doc_id + 'for model ' + model.collection.collectionName + ' not found', docErr, docData);
                callback(docErr || 'doc not found');
            }
        });        
    },
    post = function(req, res) {
        var _id = req.body._id || undefined,
            user = req.body.user,
            title = req.body.title,
            type = req.body.type,
            isAdult = req.body.isAdult,
            description = req.body.description,
            tags = req.body.tags,
            movie = req.body.movie,
            language = req.body.language,
            characters = req.body.characters,
            actors = req.body.actors,
            event = {title : req.body.event.title, link: req.body.event.link},
            createdAt = req.body.createdAt,
            lastModified = req.body.lastModified,
            context = req.body.context,
            obj = {},
            postObj;
            var saveThumb = function (fileName, callback) {
               gm(uploadPath+fileName)
              .setFormat('jpg')      
              .resize('150')
              .gravity('Center')
              .write(uploadPath+'thumb/'+fileName, function (err) {
                if (!err) {
                     console.log('Created thumbile for filename')
                      callback()       
                } else {
                    console.error('could not resize '+ uploadPath+fileName, err);
                    callback(err)  
                }
              });
                
            }
        if (req.body.image && req.body.user.id && req.body.type) {
            var filename = uuid.v1();
            var fileLoc = uploadPath + filename;
            var base64Data = req.body.image.image;
            var size = undefined;
            base64Data = base64Data.replace(/^data:image\/png;base64,/,'')
            base64data = new Buffer(base64Data,'base64')
            gm(base64data)
            .size((err, sz)=> {
                size=sz
            })
            .setFormat('jpg')            
            .write(fileLoc + '.jpg', function(err){
                if (!err) {
                    console.log('image saved')
                    saveThumb(filename+'.jpg', function(thumbErr) {
                        if (!thumbErr) {
                            obj.user= user;
                            obj.title = title;
                            obj.type = type;
                            obj.isAdult = isAdult;
                            obj.description = description;
                            obj.tags = tags;
                            obj.movie = movie;
                            obj.image = {url: '/images/'+filename + '.jpg', thumb: '/images/thumb/'+filename + '.jpg', type: 'jpg', size: size};
                            obj.language = language;
                            obj.actors = actors;
                            obj.characters = characters;
                            obj.event = event;
                            obj.createdAt = createdAt;
                            obj.lastModified = lastModified;
                            obj.context = context;
                            obj.isApproved = false;
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
                            console.error('Problem in creating thumbnail');
                            res.status(500).send({err: 'Could not save post'});
                        }
                    })
                } else {
                    console.error(err);
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
            unApproved = req.body.isApproved,
            order = req.body.order,
            isAdult = req.body.isAdult,
            context = req.body.context,
            isFavorite =  req.body.isFavorite;
            opts = {};
            if (search) {
                opts.search = search;
            } else {
                opts.advanced = {};
                opts.advanced.title = title;                
                opts.advanced.tags = tags;
                opts.advanced.movie = movie;
                opts.advanced.characters = characters;
                opts.advanced.actors = actors;
                opts.advanced.event = event;                
            }
            if (group) {
                opts.group = group;
            }
            if (isFavorite === null) {
                opts.ids = [""];
                
            }
            else if (isFavorite) {
                opts.ids = isFavorite.split(',');
            }
            if (type) {
                opts.type = type;
            }
            if (userId) {
                opts.advanced.userId = userId;
            }
            if (isAdult) {
                opts.isAdult = isAdult;
            }
            if (context) {
                opts.context = context;
            }
            if (language) {
                opts.language = language;
            }
            if (req.isAdmin && unApproved) {
                opts.unApproved = unApproved;
            }
            opts.from = from;
            opts.order = order;
            console.log('searching ', opts);
        elastic.getDocs(opts, function(err, data) {
            if (!err) {
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
                    data = data[0];
                    if (!data.views) {
                        data.views = 0;
                    }
                    data.views = data.views+1;
                    elastic.updateDoc(id, data);
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
        var tok = req.query.accessToken || req.headers['authorization'];
        isOwner(Post, req.body._id, tok, function (err) {
            if (!err) {
                var updateObj = {},
                doc = req.body,
                id = doc._id;
                if (req.body.user.id && req.body.type) {
                if (req.body.image) {
                    var filename = req.body.image.name;
                    var fileLoc = uploadPath + filename;
                }
                saveFile(fileLoc, req.body.image, function(fileErr, imageLoc) {
                    console.log('saved file');
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
                        if (doc.event && doc.event.title) {
                            updateObj.event = {} 
                            updateObj['event']['title'] = doc.event.title
                        }
                        if (doc.event && doc.event.link) {
                            if (!updateObj.event) {
                               updateObj.event = {} 
                            }
                            updateObj['event']['link'] = doc.event.link
                        }
                        if (doc.context) {
                            updateObj.context = doc.context
                        }
                        if (doc.isApproved && req.isAdmin) {
                            updateObj.isApproved = true;
                        } else {
                            updateObj.isApproved = false;
                        }
                        Post.update({_id: id}, {$set: updateObj}, function(err, numAffected) {
                            console.log('updated db with ', updateObj)
                            if (!err) {
                                console.log('Updated post ' + id + ' in database');
                                elastic.updateDoc(id, updateObj, function(err, data) {
                                    console.log('updated elastic')
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
                        var getGravity = function () {
                            var gravity;
                            var gravities = [
                                'NorthWest',
                                'North',
                                'NorthEast',
                                'West',
                                'Center',
                                'East',
                                'SouthWest',
                                'South',
                                'SouthEast'
                            ];
                            gravity = gravities[Math.floor(Math.random() * (8 - 0))];
                            console.log('selected gravity ', gravity)
                            return gravity
                        }
                        gm(readStream)
                        .gravity(getGravity())
                        .draw(['text 0,0 findameme.com'])
                        .stream(function (err, stdout, stderr) {                          
                          stdout.pipe(res);
                        });
                        Post.update({_id: postId}, { $inc: {downloads:1}}, function(updErr, updData) {
                            console.log('Increment download mongo \n',updErr, updData)
                        });
                        if (!post.downloads) {
                            post.downloads = 0;
                        }
                        post.downloads = post.downloads+1;
                        console.log(post.downloads);
                        elastic.updateDoc(postId, post, function(updErr, updData) {
                            console.log('Increment download elastic\n',updErr, updData)
                        });
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
                    console.log('data', JSON.stringify(data));
                    res.status(200).send(data.suggest)
                } else {
                    res.status(500).send(err)          
                }
            });
        } else {
            res.status(400).send({err: 'search term required'});
        }
    },
    updateLike = function (req, res) {
        var user = req.body.user,
            email = req.body.email,
            postId = req.params.id;
        Post.findByIdAndUpdate(postId, {$push: {likes: {userId: user, email: email, time: new Date().toISOString()}}}, {safe: true, new: true, upsert: true}, function(lkErr, lkData) {
            if (!lkErr) {
                elastic.updateDoc(postId, lkData, function(elErr, elData) {
                    if (!elErr) {
                        console.log('[Like] current likes ' + lkData.likes.length )
                        res.status(200).send({likes: lkData.likes.length})
                    } else {
                        console.error(elErr);
                        res.status(500).send({err: elErr});
                    }
                })
            } else {
                console.error(lkErr);
                res.status(500).send({err: lkErr})
            }            
        });
    },
    unLike = function (req, res) {
        var user = req.body.user,
            postId = req.params.id;
        Post.findById(postId, function(lkErr, lkData) {
            if (!lkErr) {
                rmIndex = lkData.likes.find(function(like, index, array){ if (like.user = user) {return index}});
                lkData.likes.splice(rmIndex, 1);
                Post.findByIdAndUpdate(postId, {$set:{likes: lkData.likes}}, function(updErr, updData) {
                    if (!updErr) {
                        elastic.updateDoc(postId, lkData, function(elErr, elData) {
                            if (!elErr) {
                                console.log('[Unlike] current likes ', lkData.likes.length )
                                res.status(200).send({likes: lkData.likes.length})
                            } else {
                                console.error(elErr);
                                res.status(500).send({err: elErr});
                            }
                        });
                    } else {
                        console.error(updErr);
                        res.status(500).send({err: updErr})
                    }
                });
            } else {
                console.error(lkErr);
                res.status(500).send({err: lkErr})
            }            
        });
    }
    updateComment = function (req, res) {
        var user = req.body.user,
            comment = req.body.comment,
            postId = req.params.id;
        Post.findByIdAndUpdate(postId, {$push: {comments: {userId: user, comment:  comment, date: new Date().toISOString()}}}, {safe: true, new: true, upsert: true}, function(lkErr, lkData) {
            if (!lkErr) {
                elastic.updateDoc(postId, lkData, function(elErr, elData) {
                    if (!elErr) {
                        res.status(200).send()
                    } else {
                        console.error(erErr);
                        res.status(500).send({err: erlErr});
                    }
                })
            } else {
                console.error(lkErr);
                res.status(500).send({err: lkErr})
            }            
        });
    }
    
    deletePost = function (req, res) {
        var postId = req.params.id;
        if (postId) {
            logger.log(1, 'delete post', 'Deleting post  ' + postId , 'postRoute.js', getIp(req), undefined);
            var tok = req.query.accessToken || req.headers['authorization'];
            isOwner( Post, postId, tok, function (err) {
                if (!err) {
                    Post.remove({_id: new ObjectID(postId)}, function(err, data){
                        if (!err) {
                            elastic.deletDoc(postId, function (delErr, delInfo) {
                                if (!delErr) {
                                    logger.log(1, 'delete post', 'Deleted post  ' + postId , 'postRoute.js', getIp(req), data)
                                    res.status(204).send();
                                } else {
                                    logger.log(3, 'delete post', 'could not deleted post  ' + postId + ' from elastic search', 'postRoute.js', getIp(req), delErr);
                                    res.status(500).send();
                                }
                            })
                        } else {
                            logger.log(3, 'delete post', 'could not deleted post  ' + postId + ' from database', 'postRoute.js', getIp(req), err);
                            res.status(500).send();
                        }            
                    });
                } else {
                    logger.log(3, 'delete post', 'could not authenticate user to deleted post  ' + postId , 'postRoute.js', getIp(req), err);
                    res.status(403).send();
                }
            });
        } else {
            logger.log(3, 'delete post', 'Delete post called without post id', 'postRoute.js', getIp(req), err);
            res.status(400).send()
        }
    }   
    requestMeme = (req, res) => {
         var user = req.body.user,
            description = req.body.description,            
            movieName = req.body.movieName,
            link = req.body.link || undefined,
            obj = {},
            postObj;
        if (req.body.user.id) {
            var filename = uuid.v1();
            var fileLoc = reqUploadPath + filename;
            if (req.body.image) {
                var base64Data = req.body.image.image;
                base64Data = base64Data.replace(/^data:image\/png;base64,/,'')
                base64data = new Buffer(base64Data,'base64')
                gm(base64data)
                .setFormat('jpg')            
                .write(fileLoc + '.jpg', function(err){
                    if (!err) {
                        obj.user= user;
                        obj.link = link;
                        obj.description = description;
                        obj.movieName = movieName;
                        obj.image = {url: '/images/'+filename + '.jpg', thumb: '/images/thumb/'+filename + '.jpg', type: 'jpg'};
                        reqObj = new Req(obj);
                        reqObj.save(function(saveErr, saveData) {
                            if (!saveErr) {
                                console.log('Saved Post ' + saveData.id)
                                res.status(200).send();              
                            } else {
                                console.error(JSON.stringify(saveErr))
                                res.status(500).send({err: 'Could not save post'});
                            }
                        });
                    } else {
                        console.error(err);
                        res.status(500).send({err: 'Could not save post'});
                    }
                });
            } else {
                obj.user= user;
                obj.link = link;
                obj.description = description;
                obj.movieName = movieName;
                reqObj = new Req(obj);
                reqObj.save(function(saveErr, saveData) {
                    if (!saveErr) {
                        console.log('Saved Post ' + saveData.id)
                        res.status(200).send();              
                    } else {
                        console.error(JSON.stringify(saveErr))
                        res.status(500).send({err: 'Could not save post'});
                    }
                });
            }
        } else {
            console.error('Params not provided');
            res.status(400).send({err: 'Bad Parameter'});
            return;
        }
    
    }
    
    return { 
        test: test,
        post: post,
        getPost: getPost,
        getPosts: getPosts,
        updatePost: updatePost,
        downloadImage: downloadImage,
        autoSuggestion: autoSuggestion,
        updateLike: updateLike,
        unLike: unLike,
        updateComment: updateComment,
        deletePost: deletePost,
        requestMeme: requestMeme
    }
}

module.exports = routes();

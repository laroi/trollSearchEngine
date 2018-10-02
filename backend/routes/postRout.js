var Post = require('../models/post.js');
var Req = require('../models/request.js');
var elastic = require('../utils/elastic');
const postUploadPath = __dirname + '/../assets/uploads/';
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
                        if (data.user = docData.user || data.type === 'admin') {
                            console.log('ownership verified ', data.type);
                            callback(undefined, docData);
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
    };
    let getImageSize = (path) => {
        console.log('[GET IMAGE SIZE] ', path)
        return new Promise((resolve, reject)=> {
            gm(path)
            .size(function (err, size) {
              if (!err) {
                    resolve(size)
                } else {
                    reject(err);                
                }
            });
        })        
    }
    let saveImage = (image, uploadPath) => {
        return new Promise((resolve, reject)=> {
            var filename = uuid.v1();
            var fileLoc = uploadPath + filename;
            var base64Data = image.image;
            var size = undefined;
            base64Data = base64Data.replace(/^data:image\/png;base64,/,'')
            base64data = new Buffer(base64Data,'base64')
            var saveThumb = function (fileName) {
                return new Promise((resolve, reject) => {
                    gm(uploadPath+fileName)
                    .setFormat('jpg')
                    .resize('100')
                    .gravity('Center')
                    .write(uploadPath+'thumb/'+fileName, function (err) {
                        if (!err) {
                             console.log('Created thumbile for filename')
                              resolve()
                        } else {
                            console.error('could not resize '+ uploadPath+fileName, err);
                            reject(err)
                        }
                      });
                })
            }

            gm(base64data)
            .setFormat('jpg')
            .write(fileLoc + '.jpg', function(err){
                if (!err) {
                    console.log('image saved')
                    saveThumb(filename+'.jpg')
                    .then(()=> {
                        return getImageSize(fileLoc + '.jpg')
                    })
                    .then((size)=> {
                        resolve({filename: filename, size: size})
                    })
                    .catch((err)=> {
                        reject(err);
                    })
                } else {
                    reject(err)
                }
            })
        })
    };
    let renameFile = (src, dst) => {
        return new Promise((resolve, reject)=> {
            fs.rename(src, dst, function(err) {
                if ( err ) {
                    if (err.code === 'ENOENT') {
                        console.warn('could not locate', src)
                        resolve();
                    }
                    reject(err)
                } else {
                    resolve();
                }
            });

        })
    };  
    let updateImage = (image, uploadPath, name) => {
        if (image) {
            name = name.split("/");
            name = name[(name.length - 1)]
            return renameFile(uploadPath+name, uploadPath+name+'.old')
            .then(()=> {
                return saveImage(image, uploadPath)     
            })
        } else {
            return Promise.resolve()
        }
    };
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
        if (req.body.image && req.body.user && req.body.type) {
            saveImage(req.body.image, postUploadPath)
            .then((fileinfo) => {
                obj.user= user;
                obj.title = title;
                obj.type = type;
                obj.isAdult = isAdult;
                obj.description = description;
                obj.tags = tags;
                obj.movie = movie;
                obj.image = {url: '/images/'+fileinfo.filename + '.jpg', thumb: '/images/thumb/'+ fileinfo.filename + '.jpg', type: 'jpg', size: fileinfo.size};
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
            })
            .catch((err)=> {
                console.error(JSON.stringify(err));
                res.status(500).send({err: 'could not save post'})
            })
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
            Post.findOne({_id: id}, function(err, data) {
                if (!err) {
                    res.status(200).send(JSON.stringify(data));
                    //Post.update({_id: id}, { $inc: {views:1}})
                    /*data = data[0];
                    if (!data.views) {
                        data.views = 0;
                    }
                    data.views = data.views+1;
                    elastic.updateDoc(id, data);*/
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
        isOwner(Post, req.body._id, tok, function (err, post) {
            if (!err) {
                var updateObj = {},
                doc = req.body,
                id = doc._id;
                doc.isApproved = doc.isApproved === 'true' ? true : false;
                if (req.body.user && req.body.type) {
                    updateImage(req.body.image, postUploadPath, post.image.url)
                    .then((fileinfo)=> {
                        if (doc.title) {
                            updateObj.title = doc.title
                        }
                        if (fileinfo && fileinfo.filename) {
                            updateObj.image = {url: '/images/'+fileinfo.filename + '.jpg', thumb: '/images/thumb/'+ fileinfo.filename + '.jpg', type: 'jpg', size: fileinfo.size};
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
                        if (doc.isApproved) {
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
                    })
                    .catch((err) => {
                        console.error("Couldn't update post", err)
                        res.status(500).send({'err': 'Could not save the post'})
                    })
                } else {
                    console.error('Could not update post', err);
                    res.status(400).send({'err':'Something went wrong'})
                }
            } else {
                console.error('Could not update post', err);
                res.status(401).send({'err':'Something went wrong'})
            }
        });
    },
    downloadImage = function (req, res){
        let postId = req.params.id;
        let imgSize = undefined;
        Post.findById(postId, function(err, post){
            if (!err) {
                var fileName = post.image.url.split('/')[2]
                imgSize = post.image.size
                fs.stat(postUploadPath+fileName, function(statErr, statData) {
                    if (!statErr) {
                        res.writeHead(200, {
                            'Content-Type': 'image/'+post.image.type,
                            'Content-Length': statData.size,
                            'Access-Control-Allow-Origin': '*',
                            'Content-Disposition': 'attachment; filename='+fileName
                        });
                        var readStream = fs.createReadStream(postUploadPath+fileName);
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
                        let getRandomArbitrary =  (min, max) => {
                            return Math.floor(Math.random() * (max - min) + min);
                        }
                        let getLogoOffset = (size) => {
                            if (size && size.width && size.height) {
                                console.log('size -> ', size.width , size.height)
                                let x = getRandomArbitrary(0, size.width - 150)
                                let y = getRandomArbitrary(0, size.height - 60)
                                console.log('Offest -> ', x , y)
                                return x + "," + y
                            }
                            console.log('Offest -> ', '0' ,'0')
                            return "0,0"
                        };
                        gm(readStream)
                        //.gravity(getGravity())
                        //.fill('#bdbdbd')
                        //.font( __dirname + '/../assets/fonts/amptmann.ttf')
                        //.fontSize(getFontSize(1000))
                        .draw('image Over ' + getLogoOffset(imgSize)+ ' 0,0 '+__dirname + '/../assets/logos/logo.png')
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
    },
    deletePost = function (req, res) {
        var postId = req.params.id;
        if (postId) {
            logger.log(1, 'delete post', 'Deleting post  ' + postId , 'postRoute.js', getIp(req), undefined);
            var tok = req.query.accessToken || req.headers['authorization'];
            isOwner( Post, postId, tok, function (err, docData) {
                if (!err) {
                    let imagePath = path.join(__dirname,'../assets/uploads', docData.image.url.split('/')[2]);
                    let thumbPath = path.join(__dirname,'../assets/uploads/thumb', docData.image.url.split('/')[2]);
                    Post.remove({_id: new ObjectID(postId)}, function(err, data){
                        if (!err) {
                            elastic.deletDoc(postId, function (delErr, delInfo) {
                                if (!delErr) {
                                    fs.unlink(imagePath, (err) => {
                                        if (!err) {
                                            fs.unlink(thumbPath, (err) => {
                                                if (!err) {
                                                    logger.log(1, 'delete post', 'Deleted post  ' + postId , 'postRoute.js', getIp(req), data)
                                                    res.status(204).send();
                                                } else {
                                                    logger.log(3, 'delete post', 'could not remove thumb image  ' + thumbPath + ' from file system', 'postRoute.js', getIp(req), delErr);
                                                    res.status(500).send();
                                                }
                                            })
                                          } else {
                                            logger.log(3, 'delete post', 'could not remove image  ' + imagePath + ' from file system', 'postRoute.js', getIp(req), delErr);
                                            res.status(500).send();
                                        }

                                    })
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
    },
    deleteRequest = function (req, res) {
        var requestId = req.params.id;
        if (requestId) {
            logger.log(1, 'delete request', 'Deleting request  ' + postId , 'postRoute.js', getIp(req), undefined);
            var tok = req.query.accessToken || req.headers['authorization'];
            isOwner(Request, requestId, tok, function (err, docData) {
                if (!err) {
                    let imagePath = path.join(__dirname,'../assets/uploads', docData.image.url.split('/')[2]);
                    let thumbPath = path.join(__dirname,'../assets/uploads/thumb', docData.image.url.split('/')[2]);
                    Request.remove({_id: new ObjectID(postId)}, function(err, data){
                        if (!err) {
                            elastic.deleteRequestDoc(requestId, function (delErr, delInfo) {
                                if (!delErr) {
                                    fs.unlink(imagePath, (err) => {
                                        if (!err) {
                                            fs.unlink(thumbPath, (err) => {
                                                if (!err) {
                                                    logger.log(1, 'delete request', 'Deleted post  ' + postId , 'postRoute.js', getIp(req), data)
                                                    res.status(204).send();
                                                } else {
                                                    logger.log(3, 'delete request', 'could not remove thumb image  ' + thumbPath + ' from file system', 'postRoute.js', getIp(req), delErr);
                                                    res.status(500).send();
                                                }
                                            })
                                          } else {
                                            logger.log(3, 'delete request', 'could not remove image  ' + imagePath + ' from file system', 'postRoute.js', getIp(req), delErr);
                                            res.status(500).send();
                                        }

                                    })
                                } else {
                                    logger.log(3, 'delete request', 'could not deleted post  ' + postId + ' from elastic search', 'postRoute.js', getIp(req), delErr);
                                    res.status(500).send();
                                }
                            })
                        } else {
                            logger.log(3, 'delete request', 'could not deleted post  ' + postId + ' from database', 'postRoute.js', getIp(req), err);
                            res.status(500).send();
                        }
                    });
                } else {
                    logger.log(3, 'delete request', 'could not authenticate user to deleted post  ' + postId , 'postRoute.js', getIp(req), err);
                    res.status(403).send();
                }
            });
        } else {
            logger.log(3, 'delete request', 'Delete request called without post id', 'postRoute.js', getIp(req), err);
            res.status(400).send()
        }
    },

    requestMeme = (req, res) => {
         var user = req.body.user,
            description = req.body.description,
            movieName = req.body.movieName,
            language = req.body.language,
            requestTitle = req.body.requestTitle,
            link = req.body.link || undefined,
            obj = {},
            postObj;
         if (req.body.user) {
            if (req.body.image) {
                saveImage(req.body.image, reqUploadPath)
                .then((filename)=> {
                    obj.user= user;
                    obj.link = link;
                    obj.description = description;
                    obj.movieName = movieName;
                    obj.requestTitle = requestTitle;
                    obj.language = language;
                    obj.image = {url: '/images/'+fileinfo.filename + '.jpg', thumb: '/images/thumb/'+fileinfo.filename + '.jpg', type: 'jpg', size: fileinfo.size};
                    reqObj = new Req(obj);
                    reqObj.save(function(saveErr, saveData) {
                        if (!saveErr) {
                            console.log('Saved Post ' + saveData.id)
                            elastic.putRequestDoc(saveData, (err)=> {
                                if (!err) {
                                    console.log('ES updated ' + saveData.id)
                                    res.status(200).send();
                                } else {
                                    console.error('ES update', err)
                                    res.status(500).send();
                                }
                            })
                        } else {
                            console.error(JSON.stringify(saveErr))
                            res.status(500).send({err: 'Could not save post'});
                        }
                    });
                })
            } else {
                obj.user= user;
                obj.link = link;
                obj.language = language;
                obj.requestTitle = requestTitle;                
                obj.description = description;
                obj.movieName = movieName;
                reqObj = new Req(obj);
                reqObj.save(function(saveErr, saveData) {
                    if (!saveErr) {
                        console.log('Saved Post ' + saveData.id)
                        elastic.putRequestDoc(saveData, (err)=> {
                                if (!err) {
                                    console.log('ES updated ' + saveData.id)
                                    res.status(200).send();
                                } else {
                                    console.error('ES update', err)
                                    res.status(500).send();
                                }
                            })
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
    let getRequest = function (req, res) {
        var id = req.params.id
        if (id) {
            Req.findOne({_id: id}, function(err, data) {
                if (!err) {
                    if (data) {
                        res.status(200).send(JSON.stringify(data));
                    } else {
                        res.status(404).send();
                    }
                } else {
                    console.error(JSON.stringify(err));
                    res.status(500).send(err)
                }
            });
        } else {
            res.status(400).send({err: 'bad request'})
        }
    },
    getRequests = function (req, res) {
        var language = req.query.language,
            movieName = req.query.moviename,
            from = req.query.from || 0,
            order = req.query.order;
            opts = {};
            if (language) {
                opts.language = language;
            }
            if (movieName) {
                opts.movieName = movieName;
            }
            opts.from = from;
            //opts.order = order;
            console.log('searching ', opts);
        elastic.getRequestDocs(opts, function(err, data) {
            if (!err) {
                res.status(200).send(data)
            } else {
                console.error(JSON.stringify(err));
                res.status(500).send({'errr': 'could not get data'})
            }
        })
    },
    updateRequest= function (req, res) {
        var tok = req.query.accessToken || req.headers['authorization'];
        isOwner(Request, req.body._id, tok, function (err, request) {
            if (!err) {
                var updateObj = {},
                doc = req.body,
                id = doc._id;
                if (req.body.user && req.body.type) {
                if (req.body.image) {
                    var filename = req.body.image.name;
                    var fileLoc = uploadPath + filename;
                }
                saveImage(req.body.image, reqUploadPath)
                .then((fileinfo)=> {
                    if (doc.description) {
                        updateObj.description = doc.description
                    }
                    if (doc.movieName) {
                        updateObj.movieName = doc.movieName;
                    }
                    if (doc.requestTitle) {
                        updateObj.requestTitle = doc.requestTitle;
                    }
                    if (doc.language) {
                        updateObj.language = doc.language
                    }
                    Request.update({_id: id}, {$set: updateObj}, function(err, numAffected) {
                        console.log('updated db with ', updateObj)
                        if (!err) {
                            console.log('Updated post ' + id + ' in database');
                            elastic.updateRequestDoc(id, updateObj, function(err, data) {
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
                })
            }
        } else {
            console.error('Could not update post', err);
            res.status(401).send({'err':'Something went wrong'})
        }
    });
    };

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
        requestMeme: requestMeme,
        getRequest: getRequest,
        getRequests: getRequests,
        deleteRequest : deleteRequest,
        updateRequest: updateRequest
    }
}

module.exports = routes();

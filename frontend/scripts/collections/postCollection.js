define(['scripts/controllers/requestController', 'scripts/controllers/storeController', 'scripts/models/postModel'], function (request, store, PostModel) {
    //Do setup work here
    var post = function() {
        var posts = [],
            current,
            total,
            limit;
        let cachedVals = {};
        let checkIfCached  = (postData) => {
            isCached = true;
            if (postData.from !== cachedVals.from) {
                isCached = false;
                console.log(postData.from, cachedVals.from, " from Cache busted")
            }
            if (postData.search !== cachedVals.search) {
                isCached = false;
                console.log(postData.search, cachedVals.search, " search Cache busted")
            }
            if (postData.title !== cachedVals.title) {
                isCached = false;
                console.log(postData.title, cachedVals.title, " title Cache busted")
            }
            if (postData.tag !== cachedVals.tag) {
                isCached = false;
                console.log(postData.tag, cachedVals.tag, " tag Cache busted")
            }
            if (postData.actor !== cachedVals.actor) {
                isCached = false;
                console.log(postData.actor, cachedVals.actor, " actor Cache busted")
            }
            if (postData.movie !== cachedVals.movie) {
                isCached = false;
                console.log(postData.movie, cachedVals.movie, " movie Cache busted")
            }
            if (postData.character !== cachedVals.character) {
                isCached = false;
                console.log(postData.character, cachedVals.character, " character Cache busted")
            }
            if (postData.context !== cachedVals.context) {
                isCached = false;
                console.log(postData.context, cachedVals.context, " context Cache busted")
            }
            if (postData.isApproved !== cachedVals.isApproved) {
                isCached = false;
                console.log(postData.isApproved, cachedVals.isApproved, " isApproved Cache busted")
            }
            if (postData.isFavorite !== cachedVals.isFavorite) {
                isCached = false;
                console.log(postData.isFavorite, cachedVals.isFavorite, " isFavorite Cache busted")
            }
            if (postData.userId !== cachedVals.userId) {
                isCached = false;
                console.log(postData.userId, cachedVals.userId, " userId Cache busted")
            }
            if (postData.language !== cachedVals.language) {
                isCached = false;
                console.log(postData.language, cachedVals.language, " language Cache busted")
            }
            return isCached;
        }
        let updateCache =(postData) => {        
            cachedVals.from = postData.from || undefined; 
                cachedVals.search = postData.search || undefined;
                cachedVals.title = postData.title || undefined;
                cachedVals.tag = postData.tag || undefined;
                cachedVals.actor = postData.actor || undefined;
                cachedVals.movie = postData.movie || undefined;
                cachedVals.character = postData.character || undefined;
                cachedVals.context = postData.context || undefined;
                cachedVals.isApproved = postData.isApproved || undefined;
                if (postData.isFavorite === undefined) {
                    cachedVals.isFavorite = undefined;
                } else if (postData.isFavorite === null) {
                    cachedVals.isFavorite = null;
                } else {
                    cachedVals.isFavorite = postData.isFavorite;
                }                
                cachedVals.userId = postData.userId || undefined;
                cachedVals.language = postData.language || undefined;
        }
        let getPostUserDetails = () => {
            return new Promise((resolve, reject)=> {
                let users = posts.map((_)=>_.user);
                if (Array.isArray(users) && users.length > 0) {
                    request._post('/api/users', {users: users})
                    .then((data)=> {
                        data.map((datum)=> {
                            for (let i = 0; i < posts.length; i+= 1) {
                                if (posts[i].user === datum._id) {
                                    posts[i].username = datum.name;
                                    posts[i].userimg = datum.picture;
                                }
                            }                        
                        })
                        resolve(posts)
                    })
                    .catch((err)=> {
                        reject(err);
                    })
                } else {
                    resolve([]);
                }
            })
        }
        getAllPosts = function (postData, force, callback) {
            if (!checkIfCached(postData) || force) {
                updateCache(postData);
                request.post('/api/posts', postData, function (err, status, data) {
                    console.log(data);
                    let hits = []
                    if (data && Array.isArray(data.hits) && data.hits.length > 0) {
                        hits = data.hits
                    }
                    postData.from = postData.from || 0;
                    postData.from = parseInt(postData.from, 10);
                    postData.limit = postData.limit || 10;
                    postData.limit = parseInt(postData.limit, 10);
                    limit = postData.limit;
                    current = (postData.from  + postData.limit)/postData.limit;
                    var stars = store.get('stars') || [];
                    if (!err) {
                        posts = [];
                    }
                    hits.forEach(function (post) {
                        var postObj = new PostModel({
                            _id : post._id,
                            user: post._source.user,
                           	title: post._source.title,
                            views: post._source.views,
                            likes: post._source.likes,
                            downloads: post._source.downloads,
                            imageUrl: post._source.image.url,
                            thumbUrl: post._source.image.thumb,
                            height : post._source.image.size ? post._source.image.size.height : 0,
                            width: post._source.image.size ? post._source.image.size.width : 0,
			                description: post._source.description,
			                tags: post._source.tags,
			                movie: post._source.movie,
			                language: post._source.language,
			                actors: post._source.actors,
			                isApproved : post._source.isApproved,
			                characters: post._source.characters,
			                context : post._source.context
			            });
			            if (store.get('userId') === post._source.user) {
			               postObj.isOwner = true; 
			            }
			            postObj.isLiked = post._source.likes.find(function(like){return like.userId === store.get('userId')})
			            postObj.isLiked = postObj.isLiked && postObj.isLiked.userId ? true : false;
			            if (stars.indexOf(post._id) > -1) {
			                postObj.isStarred = true;
			            } else {
			                postObj.isStarred = false;
			            }
			            posts.push(postObj)
                    });
                    limit = postData.limit;
                    total = data ? data.total : 0;
                    console.log('current', current, 'limit', postData.limit, 'total', total);
                    callback(err, {posts:posts, total: total, current: current, limit: limit});
                });
            } else {
                callback(undefined, undefined);
                //callback(undefined, {posts:posts, total: total, current: current, limit: limit});
            }
        };
        getUpdatedPost = () => {
            return new Promise((resolve, reject) => {
                tempCache =  Object.assign({}, cachedVals);
                let tempfrom  = parseInt(tempCache.from, 10);
                tempCache.from = ((tempfrom + limit) - 1);
                tempCache.limit = 1;
                console.log(tempCache);
                request.post('/api/updatedposts', tempCache, function (err, status, data) {
                    if (!err) {
                        let total = data.total;
                        let post;
                        let next = data.next;
                        let latest = data.latest;
                        let nextIndex;
                        let latestIndex;
                        if (next) {
                            nextIndex = posts.findIndex(_ => _._id === next._id);
                        }
                        if (latest) {
                            latestIndex = posts.findIndex(_ => _._id === latest._id);
                        }
                        if (nextIndex < 0 && next) {
                            post = next;
                        }
                        if (latestIndex < 0 && latest)  {
                            post = latest;
                        }
                        if (post) {
                            let stars = store.get('stars') || [];
                            let postObj = new PostModel({
                                _id : post._id,
                                user: post._source.user,
                               	title: post._source.title,
                                views: post._source.views,
                                likes: post._source.likes,
                                downloads: post._source.downloads,
                                imageUrl: post._source.image.url,
                                thumbUrl: post._source.image.thumb,
                                height : post._source.image.size ? post._source.image.size.height : 0,
                                width: post._source.image.size ? post._source.image.size.width : 0,
	                            description: post._source.description,
	                            tags: post._source.tags,
	                            movie: post._source.movie,
	                            language: post._source.language,
	                            actors: post._source.actors,
	                            isApproved : post._source.isApproved,
	                            characters: post._source.characters,
	                            context : post._source.context
	                        });
	                        if (store.get('userId') === post._source.user) {
	                           postObj.isOwner = true; 
	                        }
	                        postObj.isLiked = post._source.likes.find(function(like){return like.userId === store.get('userId')})
	                        postObj.isLiked = postObj.isLiked && postObj.isLiked.userId ? true : false;
	                        if (stars.indexOf(post._id) > -1) {
	                            postObj.isStarred = true;
	                        } else {
	                            postObj.isStarred = false;
	                        }
	                        resolve({post: postObj, total: total});
	                    } else {
	                        resolve(false);
	                    }
                    } else {
                        reject(err);
                    }
                });
            });            
        };
        //To replace an edited or deleted post. accepts Id of deleted/edited post, returns the next post
        removePostById = (id) => {
            return getUpdatedPost()
            .then((postObj)=> {
                posts = posts.filter(_=>_.id !== id);
                if (postObj && postObj.post) {
                    posts.push(postObj.post);
                }
                return postObj;
            })
        }
        getPostById = function(id, callback) {
            var retPost;
            for(var i = 0; i < posts.length; i += 1) {
                if (posts[i]._id === id) {
                    retPost = posts[i];
                    break;
                }
            }
            if (retPost) {
                callback(undefined, retPost);
            } else {
                request.get('/api/post/'+id, function (err, post) {
                    if (!err) {
                        //post = post[0];
                        var postObj = new PostModel({
                        _id : post._id,
                        user: post.user,
                       	title: post.title,
                        views: post.views,
                        likes: post.likes,
                        downloads: post.downloads,
                        imageUrl: post.image.url,
                        thumbUrl: post.image.thumb,
				        description: post.description,
				        tags: post.tags,
				        movie: post.movie,
				        language: post.language,
				        actors: post.actors,
				        isApproved : post.isApproved,
				        characters: post.characters,
				        context : post.context
				    });
				    if (store.get('userId') === post.user) {
				       postObj.isOwner = true; 
				    }
			        stars = store.get('stars') || [];
				    postObj.isLiked = post.likes.find(function(like){return like.userId === store.get('userId')})
				    postObj.isLiked = postObj.isLiked && postObj.isLiked.userId ? true : false;
				    if (stars.indexOf(post._id) > -1) {
				        postObj.isStarred = true;
				    }
                        callback(undefined, postObj)
                    } else {
                        callback(err, undefined);
                        console.error(err);
                    }
                })
            }
         }
        return  {
           getAllPosts: getAllPosts,
           getPostById: getPostById,
           removePostById : removePostById,
           getPostUserDetails: getPostUserDetails
        };
        
    };
    return post()
});

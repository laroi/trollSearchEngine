define(['controllers/requestController', 'controllers/storeController', 'models/postModel'], function (request, store, PostModel) {
    //Do setup work here
    var post = function() {
        var posts = [];
        getAllPosts = function (postData, callback) {
            request.post('/api/posts', postData, function (err, status, data) {
                postData.from = postData.from || 0;
                postData.from = parseInt(postData.from, 10);
                postData.limit = postData.limit || 10;
                postData.limit = parseInt(postData.limit, 10);
                limit = postData.limit;
                var current = (postData.from  + postData.limit)/postData.limit,
                    stars = store.get('stars') || [];
                if (!err) {
                    posts = [];
                }
                data.hits.hits.forEach(function (post) {
                    var postObj = new PostModel({
                        _id : post._id,
                        user: post._source.user,
                       	title: post._source.title,
                        type: post._source.type,
                        views: post._source.views,
                        likes: post._source.likes,
                        downloads: post._source.downloads,
                        isAdult: post._source.isAdult,
                        imageUrl: post._source.image.url,
                        thumbUrl: post._source.image.thumb,
				        description: post._source.description,
				        tags: post._source.tags,
				        movie: post._source.movie,
				        language: post._source.language,
				        actors: post._source.actors,
				        isApproved : post._source.isApproved,
				        characters: post._source.characters,
				        event: post._source.event,
				        context : post._source.context
				    });
				    if (postObj.type === 'clean') {
				        postObj.isClean = true;
				    }
				    if (store.get('userId') === post._source.user.id) {
				       postObj.isOwner = true; 
				    }
				    postObj.isLiked = post._source.likes.find(function(like){return like.userId === store.get('userId')})
				    postObj.isLiked = postObj.isLiked && postObj.isLiked.userId ? true : false;
				    if (stars.indexOf(post._id) > -1) {
				        postObj.isStarred = true;
				    }
				    posts.push(postObj)
                });
                console.log('current', current, 'limit', postData.limit, 'total', data.hits.total);
                callback(err, {posts:posts, total: data.hits.total, current: current, limit: postData.limit});
            });
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
                        post = post[0];
                        var postObj = new PostModel({
                        _id : post._id,
                        user: post.user,
                       	title: post.title,
                        type: post.type,
                        views: post.views,
                        likes: post.likes,
                        downloads: post.downloads,
                        isAdult: post.isAdult,
                        imageUrl: post.image.url,
                        thumbUrl: post.image.thumb,
				        description: post.description,
				        tags: post.tags,
				        movie: post.movie,
				        language: post.language,
				        actors: post.actors,
				        isApproved : post.isApproved,
				        characters: post.characters,
				        event: post.event,
				        context : post.context
				    });
				    if (postObj.type === 'clean') {
				        postObj.isClean = true;
				    }
				    if (store.get('userId') === post.user.id) {
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
           getPostById: getPostById
        };
        
    };
    return post()
});

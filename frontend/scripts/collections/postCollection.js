define(['controllers/requestController', 'controllers/storeController', 'models/postModel'], function (request, store, PostModel) {
    //Do setup work here
    var post = function() {
        var posts = [];
        getAllPosts = function (postData, callback) {
            request.post('/api/posts', postData, function (err, status, data) {
                if (!err) {
                    posts = [];
                }
                data.hits.hits.forEach(function (post) {
                    var postObj = new PostModel({
                        _id : post._id,
                        userId: post._source.userId,
                       	title: post._source.title,
                        type: post._source.type,
                        views: post._source.views,
                        downloads: post._source.downloads,
                        isAdult: post._source.isAdult,
                        imageUrl: post._source.image.url,
				        description: post._source.description,
				        tags: post._source.tags,
				        movie: post._source.movie,
				        language: post._source.language,
				        actors: post._source.actors,
				        characters: post._source.characters,
				        event: post._source.event
				    });
				    if (store.get('userID') === post._source.userId) {
				       postObj.isOwner = true; 
				    }
				    posts.push(postObj)
                });
                callback(err, posts)
            });
        }
        getPostById = function(id) {
            var retPost;
            for(var i = 0; i < posts.length; i += 1) {
                if (posts[i]._id === id) {
                    retPost = posts[i];
                    break;
                }
            }
            return retPost;
         }
        return  {
           getAllPosts: getAllPosts,
           getPostById: getPostById
        };
        
    };
    return post()
});

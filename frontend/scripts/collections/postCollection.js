define(['controllers/requestController', 'controllers/storeController', 'models/postModel'], function (request, store, PostModel) {
    //Do setup work here
    var post = function() {
        var posts = [];
        getAllPosts = function (postData, callback) {
            request.post('/api/posts', postData, function (err, status, data) {
                data.hits.hits.forEach(function (post) {
                    var postObj = new PostModel({
                        _id : post._id,
                        userId: post._source.userId,
                       	title: post._source.title,
                        type: post._source.type,
                        isAdult: post._source.isAdult,
                        imageUrl: post._source.imageUrl,
				        description: post._source.description,
				        tags: post._source.tags,
				        movie: post._source.movie,
				        language: post._source.language,
				        actors: post._source.actors,
				        characters: post._source.characters,
				        event: post._source.event
				    });
				    posts.push(postObj)
                });
                callback(err, posts)
            });
        }
        return  {
           getAllPosts: getAllPosts
        };
        
    };
    return post()
});

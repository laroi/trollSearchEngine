define(['controllers/requestController', 'controllers/storeController', 'models/postModel'], function (request, store, post) {
    //Do setup work here
    var post = function() {
        getAllPosts = function (postData, callback) {
            request.post('/api/posts', postData, function (err, data) {
                if (!err) {
                    console.log(data)
                } else {
                    console.error(err)
                }
            });
        }
        return  {
           getAllPosts: getAllPosts
        };
        
    };
    return post
});

define(['scripts/controllers/requestController', 'scripts/controllers/storeController'], function (request, store) {
    //Do setup work here
    var date = new Date();
    var post = function(inPost) {
    var like = function(user, email, callback) {
        request.put('/api/post/'+this._id+'/like',{user: user, email:email}, function(err, data) {
            callback(err, data)
        });
     };
     var unlike = function (user, callback) {
        request.put('/api/post/'+this._id+'/unlike',{user: user}, function(err, data) {
            callback(err, data)
        })
     };
        var save = function () {
            var postData = {
            	userId: store.get('userId'),
               	title: this.title,
                image:'',
                group: this.group,
                likes: this.likes,
				description: this.description,
				tags:this.tags,
				movie: this.movie,
				language: this.language,
				actors:this.actors,
				context : this.context,
				characters:this.characters,
				isApproved: this.isApproved,
				createdAt: date.toISOString(),
				lastModified: date.toISOString()
            }
        };
            return  {
                _id: inPost._id || "",
               	title: inPost.title || '',
               	user: inPost.user || '',
				description: inPost.description || '',
				imageUrl: inPost.imageUrl || '',
				thumbUrl: inPost.thumbUrl || '',
				width: inPost.width || 0,
				height: inPost.height || 0,
				tags: inPost.tags || [],
				movie: inPost.movie || '',
				views: inPost.views || 0,
				likes: inPost.likes || [],
				downloads: inPost.downloads || 0,
				language: inPost.language || '',
				actors: inPost.actors || [],
				characters: inPost.characters || [],
				event: inPost.event || '',
				lastModified: inPost.lastModified,
				createdAt: inPost.createdAt,
				isApproved: inPost.isApproved,
				context: inPost.context,
				isOwner: false,
                save: save,
                like: like,
                unlike: unlike
            };
        
    };
    return post
});

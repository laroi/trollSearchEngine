define(['controllers/requestController', 'controllers/storeController'], function (request, store) {
    //Do setup work here
    var date = new Date();
    var post = function(inPost) {
    var like = function(user, email, callback) {
        request.put('/api/post/'+this._id+'/like',{user: user, email:email}, undefined, function(err, data) {
            callback(err, data)
        });
     };
     var unlike = function (user, callback) {
        request.put('/api/post/'+this._id+'/unlike',{user: user}, undefined, function(err, data) {
            callback(err, data)
        })
     };
        var save = function () {
            var postData = {
            	userId: store.get('userId'),
               	title: this.title,
                type: this.type,
                isAdult: this.isAdult,
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
				event: this.event,
				isApproved: this.isApproved,
				createdAt: date.toISOString(),
				lastModified: date.toISOString()
            }
        };
            return  {
                _id: inPost._id || "",
               	title: inPost.title || '',
               	user: inPost.user || '',
                type: inPost.type || '',
                isAdult: inPost.isAdult || '',
				description: inPost.description || '',
				imageUrl: inPost.imageUrl || '',
				tags: inPost.tags || [],
				group: inPost.group || '',
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

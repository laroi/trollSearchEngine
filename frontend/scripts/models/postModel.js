define(['controllers/requestController', 'controllers/storeController'], function (request, store) {
    //Do setup work here
    var date = new Date();
    var post = function(inPost) {
        var save = function () {
            var postData = {
            	userId: store.get('userId'),
               	title: this.title,
                type: this.type,
                isAdult: this.isAdult,
                image:'',
				description: this.description,
				tags:this.tags,
				movie: this.movie,
				language: this.language,
				actors:this.actors,
				characters:this.characters,
				event: this.event,
				createdAt: date.toISOString(),
				lastModified: date.toISOString()
            }
        };
            return  {
                _id: inPost._id || "",
               	title: inPost.title || '',
               	userId: inPost.userId || '',
                type: inPost.type || '',
                isAdult: inPost.isAdult || '',
				description: inPost.description || '',
				imageUrl: inPost.imageUrl || '',
				tags: inPost.tags || [],
				movie: inPost.movie || '',
				views: inPost.views || 0,
				downloads: inPost.downloads || 0,
				language: inPost.language || '',
				actors: inPost.actors || [],
				characters: inPost.characters || [],
				event: inPost.event || '',
				lastModified: inPost.lastModified,
				createdAt: inPost.createdAt,
				isOwner: false,
                save: save
            };
        
    };
    return post
});
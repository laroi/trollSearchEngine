define(['controllers/requestController', 'controllers/storeController'], function (request, store) {
    //Do setup work here
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
				event: this.event
            }
        };
            return  {
                _id: inPost._id || "",
               	title: inPost.title || '',
                type: inPost.type || '',
                isAdult: inPost.isAdult || '',
				description: inPost.description || '',
				imageUrl: inPost.imageUrl || '',
				tags: inPost.tags || [],
				movie: inPost.movie || '',
				language: inPost.language || '',
				actors: inPost.actors || [],
				characters: inPost.characters || [],
				event: inPost.event || '',
                save: save
            };
        
    };
    return post
});

define(['controllers/requestController', 'controllers/storeController'], function (request, store) {
    //Do setup work here
    var post = function() {
        var save = function () {
            var postData = {
            	userId: store.get('userId'),
               	title: this.title,
                type: this.type,
                image: '',
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
                _id: '',
               	title: '',
                type: '',
				description: '',
				tags:[],
				movie: '',
				language: '',
				actors:[],
				characters:[],
				event: '',
                save: save
            };
        
    };
    return post
});

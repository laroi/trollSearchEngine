define(['scripts/controllers/requestController', 'scripts/controllers/storeController'], function (request, store) {
    //Do setup work here
    var date = new Date();
    var request = function(inRequest) {
        var save = function () {
            var postData = {
            	userId: store.get('userId'),
               	movieName: this.movieName,
                language: this.language,
                description: this.description,
                link:this.link,
                status: this.status,
                image: {},
				dates: {}
            }
        };
            return  {
                _id: inRequest._id || "",
               	user: inRequest.user || '',
                movieName: inRequest.movieName || '',
                language: inRequest.language || '',
                title: inRequest.title || '',
				description: inRequest.description || '',
				link: inRequest.link || '',
				status: inRequest.status || '',
				dates: inRequest.dates || 0,
				image: inRequest.image || 0
            };
        
    };
    return request
});

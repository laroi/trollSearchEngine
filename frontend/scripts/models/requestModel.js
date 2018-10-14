define(['scripts/controllers/requestController', 'scripts/controllers/storeController'], function (requestController, store) {
    //Do setup work here
    var date = new Date();
    var request = function(inRequest) {
        var save = function () {
            var postData = {
            	userId: store.get('userId'),
               	movie: this.movie,
                language: this.language,
                description: this.description,
                link:this.link,
                image : this.image
            }
            let func = undefined;
            if (this._id) {
                return new Promise((resolve, reject)=> {
                    console.log('[UPDATE REQUEST] ', this._id);
                    if (this.image) {
                        func = requestController.putImage;
                    } else {
                        func = requestController.put;
                    }
                    func('/api/request/'+this._id, postData, function(err) {
                        if (!err) {
                            resolve()
                        } else {
                            reject(err)
                        }
                    })
                })
            } else {
                return new Promise((resolve, reject)=> {
                    console.log('[POST REQUEST] ', this._id);
                    if (this.image) {
                        func = requestController.postImage;
                    } else {
                        func = requestController.post;
                    }
                    func('/api/request/' + this._id, postData, function(err) {
                        if (!err) {
                            resolve()
                        } else {
                            reject(err)
                        }
                    })
                })
            }
        };
        let retObject = {};
        if (inRequest._id) {
            retObject._id = inRequest._id;
        }
        if (inRequest.user) {
            retObject.user = inRequest.user;
        }
        if (inRequest.movie) {
            retObject.movie = inRequest.movie;
        }
        if (inRequest.language) {
            retObject.language = inRequest.language;
        }
        if (inRequest.title) {
            retObject.title = inRequest.title;
        }
        if (inRequest.description) {
            retObject.description = inRequest.description
        }
        if (inRequest.link) {
            retObject.link = inRequest.link;
        }
        if (inRequest.status) {
            retObject.status = inRequest.status;
        }
        retObject.save = save;
        return retObject;
        
    };
    return request
});

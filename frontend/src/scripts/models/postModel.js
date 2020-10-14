//define(['app/controllers/requestController', 'app/controllers/storeController'], function (request, store) {
    import requestController from '../controllers/requestController';
    import storeController from '../controllers/storeController';
    var date = new Date();
    var post = function(inPost) {
    var like = function(user, email, callback) {
        let that = this;
        requestController.put('/api/post/'+this._id+'/like',{user: user, email:email}, function(err, data) {
            if (!err) {
                that.isLiked = true;
                that.likes.push({userId: storeController.get('userId')});
            }
            callback(err, data)
        });
     };
     var unlike = function (user, callback) {
        let that = this;
        requestController.put('/api/post/'+this._id+'/unlike',{user: user}, function(err, data) {
            if (!err) {
                that.isLiked = false;
                that.likes -= 1;
                that.likes.splice(that.likes.findIndex(_=> _.userId === storeController.get('userId')), 1);
            }
            callback(err, data)
        })
     };
     var downloadOrShare = function(action) {
        let postObj = this;
        if (action && ['download', 'share'].indexOf(action) >= 0) {
            return requestController.getImage('/api/image/'+postObj._id, postObj._id, action)
                .then((file)=> {
                    if (action == 'download') {
                        postObj.downloads.push({userId: storeController.get('userId')});
                        return postObj.downloads;
                    }
                    if (action == 'share') {
                        postObj.shares.push({userId: storeController.get('userId')});
                        return {file, postObj};
                    }
                })
        }
        return Promise.reject('Invalid Action'); 
            
     };
        var save = function () {
            var postData = {
            	userId: storeController.get('userId'),
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
				views: inPost.views || [],
				likes: inPost.likes || 0,
				downloads: inPost.downloads || [],
				shares: inPost.shares || [],
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
                unlike: unlike,
                downloadOrShare: downloadOrShare
            };
        
    };
    export default post
//});

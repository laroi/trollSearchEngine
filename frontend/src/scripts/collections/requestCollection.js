define(['app/controllers/requestController', 'app/controllers/storeController', 'app/models/requestModel'], function (requestController, store, RequestModel) {
    //Do setup work here
    var request = function() {
        var requests = [],
            current,
            total,
            limit;
        let cachedVals = {};
        let checkIfCached  = (postData) => {
            isCached = true;
            if (postData.from !== cachedVals.from) {
                isCached = false;
                console.log(postData.from, cachedVals.from, " from Cache busted")
            }
            if (postData.search !== cachedVals.search) {
                isCached = false;
                console.log(postData.search, cachedVals.search, " search Cache busted")
            }
            if (postData.title !== cachedVals.title) {
                isCached = false;
                console.log(postData.title, cachedVals.title, " title Cache busted")
            }
            if (postData.tag !== cachedVals.tag) {
                isCached = false;
                console.log(postData.tag, cachedVals.tag, " tag Cache busted")
            }
            if (postData.actor !== cachedVals.actor) {
                isCached = false;
                console.log(postData.actor, cachedVals.actor, " actor Cache busted")
            }
            if (postData.movie !== cachedVals.movie) {
                isCached = false;
                console.log(postData.movie, cachedVals.movie, " movie Cache busted")
            }
            if (postData.character !== cachedVals.character) {
                isCached = false;
                console.log(postData.character, cachedVals.character, " character Cache busted")
            }
            if (postData.event !== cachedVals.event) {
                isCached = false;
                console.log(postData.event, cachedVals.event, " event Cache busted")
            }
            if (postData.context !== cachedVals.context) {
                isCached = false;
                console.log(postData.context, cachedVals.context, " context Cache busted")
            }
            if (postData.isPlain !== cachedVals.isPlain) {
                isCached = false;
                console.log(postData.isPlain, cachedVals.isPlain, " isPlain Cache busted")
            }
            if (postData.isAdult !== cachedVals.isAdult) {
                isCached = false;
                console.log(postData.isAdult, cachedVals.isAdult, " isAdult Cache busted")
            }
            if (postData.isApproved !== cachedVals.isApproved) {
                isCached = false;
                console.log(postData.isApproved, cachedVals.isApproved, " isApproved Cache busted")
            }
            if (postData.isFavorite !== cachedVals.isFavorite) {
                isCached = false;
                console.log(postData.isFavorite, cachedVals.isFavorite, " isFavorite Cache busted")
            }
            if (postData.userId !== cachedVals.userId) {
                isCached = false;
                console.log(postData.userId, cachedVals.userId, " userId Cache busted")
            }
            if (postData.language !== cachedVals.language) {
                isCached = false;
                console.log(postData.language, cachedVals.language, " language Cache busted")
            }
            return isCached;
        }
        let updateCache =(postData) => {        
            cachedVals.from = postData.from || undefined; 
                cachedVals.search = postData.search || undefined;
                cachedVals.title = postData.title || undefined;
                cachedVals.tag = postData.tag || undefined;
                cachedVals.actor = postData.actor || undefined;
                cachedVals.movie = postData.movie || undefined;
                cachedVals.character = postData.character || undefined;
                cachedVals.event = postData.event || undefined;
                cachedVals.context = postData.context || undefined;
                cachedVals.isPlain = postData.isPlain || undefined;
                cachedVals.isAdult = postData.isAdult || undefined;
                cachedVals.isApproved = postData.isApproved || undefined;
                if (postData.isFavorite === undefined) {
                    cachedVals.isFavorite = undefined;
                } else if (postData.isFavorite === null) {
                    cachedVals.isFavorite = null;
                } else {
                    cachedVals.isFavorite = postData.isFavorite;
                }                
                cachedVals.userId = postData.userId || undefined;
                cachedVals.language = postData.language || undefined;
        }
        let getRequestUserDetails = () => {
            return new Promise((resolve, reject)=> {
                let users = requests.map((_)=>_.user);
                if (users.length > 0 ) {
                    requestController._post('/api/users', {users: users})
                    .then((data)=> {
                        data = data || [];
                        data.map((datum)=> {
                            for (let i = 0; i < requests.length; i+= 1) {
                                if (requests[i].user === datum._id) {
                                    requests[i].username = datum.name;
                                    requests[i].userimg = datum.picture;
                                }
                            }                        
                        })
                        resolve(requests)
                    })
                    .catch((err)=> {
                        reject(err);
                    })
                } else {
                    resolve([]);
                }
            })
        }
        getAllRequests = function (requestData, force, callback) {
            /*if (!checkIfCached(postData) || force) {
                updateCache(postData);
                if (postData.request) {
                    
                } else {*/
                    requestController.get('/api/requests?from='+requestData.from, function (err, data) {
                        let hits = []
                        if (data && Array.isArray(data.hits) && data.hits.length > 0) {
                            hits = data.hits
                            requests = [];
                        }
                        requestData.from = parseInt((requestData.from || 0), 10);
                        requestData.limit = parseInt((requestData.limit || 0), 10);
                        limit = requestData.limit;
                        current = (requestData.from  + requestData.limit)/requestData.limit;
                        if (!err) {
                            requets = [];
                        }
                        hits.forEach(function (req) {
                            var requestObj = new RequestModel({
                                _id : req._id,
                                user: req._source.requestUser,
                               	movie: req._source.requestMovie,
                                language: req._source.requestLanguage,
                                title: req._source.requestTitle,
                                description: req._source.requestDescription,
                                link: req._source.requestLink,
                                status: req._source.requestStatus,
				            });
				            if (req._source.requestImage) {
				                requestObj.imageUrl = req._source.requestImage.url,
                                requestObj.thumbUrl = req._source.requestImage.thumb,
                                requestObj.height  = req._source.requestImage.size ? req._source.requestImage.size.height : 0,
                                requestObj.width = req._source.requestImage.size ? req._source.requestImage.size.width : 0
				            }
				            if (store.get('userId') === req._source.requestUser) {
				               requestObj.isOwner = true; 
				            }
				            requests.push(requestObj)
                        });
                        limit = requestData.limit;
                        total = data ? data.total : 0;
                        console.log('current', current, 'limit', requestData.limit, 'total', total);
                        callback(err, {requests:requests, total: total, current: current, limit: limit});
                    });
               /* }
            } else {
                callback(undefined, undefined);
                //callback(undefined, {posts:posts, total: total, current: current, limit: limit});
            }*/
        }
        getRequestById = function(id, callback) {
            var retPost;
            for(var i = 0; i < requests.length; i += 1) {
                if (requests[i]._id === id) {
                    retPost = requests[i];
                    break;
                }
            }
            if (retPost) {
                callback(undefined, retPost);
            } else {
                requestController.get('/api/request/'+id, function (err, request) {
                    if (!err) {
                        request = request[0];
                        var requestObj = new RequestModel({
                            user: request.user,
                           	movieName: request.movie,
                            language: request.language,
                            title: request.title,
                            description: request.description,
                            link: request.link,
                            status: request.status
				        });				    
				    if (store.get('userId') === request.user) {
				       requestObj.isOwner = true; 
				    }
                        callback(undefined, requestObj)
                    } else {
                        callback(err, undefined);
                        console.error(err);
                    }
                })
            }
         };
         let deleteRequestById = (id) => {
            return new Promise((resolve, reject)=> {
                console.log('[DELETE REQUEST] ', id);
                requestController.del('/api/request/'+id, function(err) {
                    if (!err) {
                        resolve()
                    } else {
                        reject(err)
                    }
                })
            })
         }
         let updateRequestById = (data) => {
            return new Promise((resolve, reject)=>{
               var requestObj = new RequestModel(data);
               requestObj.save()
               .then(()=> {
                    getRequestById(data._id, (err, requestModel) => {
                        if (!err) {
                            requestModel = Object.assign(requestModel, data)
                            resolve();
                        } else {
                            reject(err);
                        }
                    })
               })
               .catch((err) => {
                    reject(err);
               })           
            })
           
         }
        return  {
           getAllRequests: getAllRequests,
           getRequestById: getRequestById,
           getRequestUserDetails: getRequestUserDetails,
           deleteRequestById: deleteRequestById,
           updateRequestById: updateRequestById
        };
        
    };
    return request()
});

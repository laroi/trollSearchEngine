var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'info'
});
var elastic = function () {
    var putMapping = function (callback) {
        client.indices.putMapping({
            index: 'trolls',
            type: 'post',
            body:{
                properties: {
                    userId: {"type" : "string", "index" : "not_analyzed"},
                    title: {"type" : "string"},
                    type: {"type" : "string", "index" : "not_analyzed"},
                    isAdult: {"type" : "boolean", "index" : "not_analyzed"},
                    image: {"type" : "object", 
                        "properties" : {
                            "url" : {"type" : "string", "index" : "not_analyzed"},
                            "type" : {"type" : "string", "index" : "not_analyzed"}
                        }
                    },
                    descriptions: {"type" : "string"},
                    likes: {"type": "integer",},
                    views: {"type": "integer"},
                    downloads: {"type": "integer"},
                    comments:{
                        properties:{
                            userId: {"type": "string", "index" : "not_analyzed"},
                            comment:  {"type": "string"},
                            createdAt: {"type": "date"}
                        }
                    },
                    tags: {"type" : "string"},
                    movie: {"type" : "string"},
                    language: {"type" : "string"},
                    actors: {"type" : "string"},
                    characters: {"type" : "string"},
                    event: {"type" : "string"},
                    createdAt: {"type" : "date"},
                    lastModified: {"type": "date"}
                }
            }
            
        }, function (err, resp, respcode) {
                if (!err) {
                    callback()
                    return;
                } else {
                    console.error(err);
                    callback(err);
                    return;
                }
            });
    }
    var init = function (callback) {
        client.indices.exists({index:'trolls'}, function (existErr, existData) {
            if (existData) {
                if (callback && typeof callback === 'function') {
                    callback();
                }
                return
            } else {
                client.indices.create({index: 'trolls'}, function(createErr, createData) {
                    if (!createErr) {
                        putMapping(function(err) {
                            if (!err) {
                            console.log('Putting index');
                                if (callback && typeof callback === 'function') {
                                    callback();
                                }
                            }
                        })
                    }
                })
            }
        });
    };
    var putDoc = function (doc, callback) {
    var body = {
                userId: doc.userId,
                title: doc.title,
                type: doc.type,
                isAdult : doc.isAdult,
                image: doc.image,
                descriptions: doc.descriptions,
                tags: doc.tags,
                movie: doc.movie,
                language: doc.language,
                actors: doc.actors,
                likes: doc.likes || 0,
                downloads: doc.downloads || 0,
                views : doc.views || 0,
                characters: doc.characters,
                comments: doc.comments,
                event: doc.event,
                createdAt: doc.createdAt,
                lastModified: doc.lastModified
            }
        client.create({
            index: 'trolls',
            id: doc.id,
            type: 'post',
            /*body: {
                userId: doc.userId,
                title: doc.title,
                type: doc.type,
                isAdult: doc.isAdult,
                imageUrl: doc.imageUrl,
                descriptions: doc.descriptions,
                tags: doc.tags,
                movie: doc.movie,
                language: doc.language,
                actors: doc.actors,
                characters: doc.characters,
                comments: doc.comments,
                event: doc.event,
                lastModified: doc.lastModified,
                createdAt: doc.createdAt
            }*/
            body: body
        }, function (error, response) {
            if (!error) {
                console.log('Put document ' + response._id);
            } else {
                console.error('Problem in putting doc', JSON.stringify(error))
            }
            callback(error, response);
        });
    };
    var getDocs = function(options, callback) {
    var should_array = [],
        must_array = [],
        body = {};
        if (options.advanced && Object.keys(options.advanced).length > 0) {
            if (options.advanced.userId) {
                must_array.push({ "match": { "userId": options.advanced.userId }});
            }
            if (options.advanced.title) {
                must_array.push({ "match": { "title": options.advanced.title }});
            }
            if (options.advanced.tags) {
                must_array.push({ "match": { "tags": options.advanced.tags }});
            }
            if (options.advanced.movie) {
                must_array.push({ "match": { "movie": options.advanced.movie }});
            }
            if (options.advanced.language) {
                must_array.push({ "match": { "movie": options.advanced.language }});
            }
            if (options.advanced.actors) {
                must_array.push({ "match": { "actors": options.advanced.actors }});
            }
            if (options.advanced.characters) {
                must_array.push({ "match": { "characters": options.advanced.characters }});
            }
            if (options.advanced.event) {
                must_array.push({ "match": { "event": options.advanced.event }});
            }
        } else if (options.search){
            should_array.push({ "match": { "userId": options.search}});
            should_array.push({ "match": { "title": options.search }});
            should_array.push({ "match": { "tags": options.search }});
            should_array.push({ "match": { "movie": options.search }});
            should_array.push({ "match": { "actors": options.search }});
            should_array.push({ "match": { "characters": options.search }});
            should_array.push({ "match": { "event": options.search }});
            
        }
        if (options.type) {
            should_array.push({ "match": { "type": options.type }});
        }
        body = {
            query: {
                bool: {}
              },
               "from" : options.from || 0,
               "size" : 10,
              "sort": [
                 {
                    "lastModified": {
                       "order": options.order || "desc"
                    }
                 }
              ]
        };
        if (should_array.length > 0) {
            body.query.bool.should = should_array
        }
        if (should_array.length > 0) {
            body.query.bool.must = must_array
        }
        client.search({
            index: 'trolls',
            type: 'post',
            body: body
        }, function (error, response) {
            callback(error, response);
        });
    }
    var updateDoc = function (id, doc, callback) {
        client.update({
            index: 'trolls',
            id: id,
            type: 'post',
            body: {
                doc: doc
            }
        }, function(err, data){
            if (callback && typeof callback === 'function') {
                callback(err, data);
            }
        });
    }
    return {
        init: init,
        putDoc: putDoc,
        getDocs: getDocs,
        updateDoc: updateDoc
    }
}

module.exports = elastic()

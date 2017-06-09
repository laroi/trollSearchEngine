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
                    user: {"type" : "object", 
                    "properties" : {
                            "id" : {"type" : "string", "index" : "not_analyzed"},
                            "name" : {"type" : "string", "index" : "not_analyzed"},
                            "image" : {"type" : "string", "index" : "not_analyzed"}
                        }
                    },
                    title: {"type" : "string"},
                    context: {"type" : "string"},
                    type: {"type" : "string", "index" : "not_analyzed"},
                    isAdult: {"type" : "boolean", "index" : "not_analyzed"},
                    image: {"type" : "object", 
                        "properties" : {
                            "url" : {"type" : "string", "index" : "not_analyzed"},
                            "type" : {"type" : "string", "index" : "not_analyzed"}
                        }
                    },
                    descriptions: {"type" : "string"},
                    likes: {
                        properties:{
                            userId: {"type": "string", "index" : "not_analyzed"},
                            username: {"type": "string", "index" : "not_analyzed"},
                            time:  {"type": "date"}
                        }
                    },
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
                    lastModified: {"type": "date"},
                    titleSuggest: {
                        type: "completion",
                        analyzer: "simple",
                        payloads: true,
                        preserve_separators: true,
                        preserve_position_increments: true,
                        max_input_length: 50
                    },
                    tagSuggest: {
                        type: "completion",
                        analyzer: "simple",
                        payloads: true,
                        preserve_separators: true,
                        preserve_position_increments: true,
                        max_input_length: 50
                    },
                    actorSuggest: {
                        type: "completion",
                        analyzer: "simple",
                        payloads: true,
                        preserve_separators: true,
                        preserve_position_increments: true,
                        max_input_length: 50
                    },
                    characterSuggest: {
                        type: "completion",
                        analyzer: "simple",
                        payloads: true,
                        preserve_separators: true,
                        preserve_position_increments: true,
                        max_input_length: 50
                    },
                    eventSuggest: {
                        type: "completion",
                        analyzer: "simple",
                        payloads: true,
                        preserve_separators: true,
                        preserve_position_increments: true,
                        max_input_length: 50
                    },
                    movieSuggest: {
                        type: "completion",
                        analyzer: "simple",
                        payloads: true,
                        preserve_separators: true,
                        preserve_position_increments: true,
                        max_input_length: 50
                    }
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
                user: doc.user,
                title: doc.title,
                type: doc.type,
                isAdult : doc.isAdult,
                image: doc.image,
                descriptions: doc.descriptions,
                tags: doc.tags,
                movie: doc.movie,
                language: doc.language,
                actors: doc.actors,
                likes: doc.likes || [],
                downloads: doc.downloads || 0,
                views : doc.views || 0,
                characters: doc.characters,
                comments: doc.comments,
                event: doc.event,
                createdAt: doc.createdAt,
                lastModified: doc.lastModified,
                titleSuggest: {
                    input: doc.title.split(" "),
                    output: doc.title,
                    payload:{
                        user: doc.userId,
                        image:  doc.image,
                        movie: doc.movie
                    }
                },
                tagSuggest: {
                    input: doc.tags,
                    output: doc.tags,
                    payload:{
                        user: doc.userId,
                        image:  doc.image,
                        movie: doc.movie
                    }
                },
                actorSuggest: {
                    input: doc.actors,
                    output: doc.actors,
                    payload:{
                        user: doc.userId,
                        image:  doc.image,
                        movie: doc.movie
                    }
                },
                characterSuggest: {
                    input: doc.characters,
                    output: doc.characters,
                    payload:{
                        user: doc.userId,
                        image:  doc.image,
                        movie: doc.movie
                    }
                },
                eventSuggest: {
                    input: doc.event.split(" "),
                    output: doc.event,
                    payload:{
                        user: doc.userId,
                        image:  doc.image,
                        movie: doc.movie
                    }
                },
                movieSuggest: {
                    input: doc.movie.split(" "),
                    output: doc.movie,
                    payload:{
                        user: doc.userId,
                        image:  doc.image,
                        movie: doc.language
                    }
                }
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
                must_array.push({ "match": { "user.id": options.userId }});
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
                must_array.push({ "match": { "language": options.advanced.language }});
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
            should_array.push({ "match": { "user.id": options.search}});
            should_array.push({ "match": { "title": options.search }});
            should_array.push({ "match": { "tags": options.search }});
            should_array.push({ "match": { "movie": options.search }});
            should_array.push({ "match": { "actors": options.search }});
            should_array.push({ "match": { "characters": options.search }});
            should_array.push({ "match": { "event": options.search }});
            
        }
        if (options.ids && options.ids.length > 0) {
                must_array.push({ "terms": { "_id": options.ids }});
        }
        if (options.group) {
            must_array.push({ "match": { "group": options.group }});
        }
        if (options.type) {
            must_array.push({ "match": { "type": options.type }});
        }
        if (options.isAdult) {
            must_array.push({ "match": { "isAdult": options.isAdult }});
        }            
        if (options.type) {
            must_array.push({ "match": { "type": options.type }});
        }
        body = {
            aggs : {
                posts:{
                   top_hits:{
                     size:10
                   }
                 }
            },
            query: {
                bool: {
                    must:must_array,
                    should:should_array
                }
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
        console.log('options\n');
        console.log(JSON.stringify(options));
        console.log('options Ends\n');
        console.log('Search Query\n');
        console.log(JSON.stringify(body));
        console.log('Search Query Ends\n');
        client.search({
            index: 'trolls',
            type: 'post',
            body: body
        }, function (error, response) {
            callback(error, response);
        });
    }
    var getSuggestions = function(options, callback) {
        var fieldMap = {
            title: 'titleSuggest',
            tag: 'tagSuggest',
            actor: 'actorSuggest',
            character: 'characterSuggest',
            event: 'eventSuggest',
            movie: 'movieSuggest'
        },
        suggestObj = {
            suggest: {}
        };
        if (Array.isArray(options.fields) && options.fields.length > 0) {
            options.fields.forEach(function(field) {
                suggestObj.suggest[field]={text: options.query,
                    completion : {
                        field: fieldMap[field]
                    } 
                  }
            });            
        } else {
            Object.keys(fieldMap).forEach(function(field) {
                suggestObj.suggest[field]={text: options.query,
                    completion : {
                        field: fieldMap[field]
                    } 
                  }
            });         
        }
        console.log('\n' + JSON.stringify(suggestObj) + '\n')
        client.search({
            index: 'trolls',
            type: 'post',
            body: suggestObj
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
        updateDoc: updateDoc,
        getSuggestions: getSuggestions
    }
}

module.exports = elastic()

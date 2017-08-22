var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'info',
  apiVersion: '5.5'
});
var elastic = function () {
    var putSettings = function (callback) {        
        client.indices.close({index: 'trolls'},function(err) {
        console.log('closed index')
          if (!err) {
          client.indices.putSettings({
          index: 'trolls',
          body:{
            "settings": {
              "analysis": {
                 "filter": {
                    "edge_ngram_filter": {
                       "type": "edge_ngram",
                       "min_gram": 2,
                       "max_gram": 20
                    }
                 },
                 "analyzer": {
                    "edge_ngram_analyzer": {
                       "type": "custom",
                       "tokenizer": "standard",
                       "filter": [
                          "lowercase",
                          "edge_ngram_filter"
                       ]
                    }
                 }
              }
            }
            }
        }, function(setErr, setResp, setRespCode) {
            if (!setErr) {
                console.log('put settings', setErr, setResp,  setRespCode)
                client.indices.open({index: 'trolls'}, function() {
                    console.log('opened index')
                    callback();
                });     
            } else {
                console.error(setErr);
                callback(setErr);
                return;
            }
            });
        } else {
            console.error('error in closing index', err);
            callback(err);
        }
        })
        
    }
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
                        isApproved: {"type" : "boolean", "index" : "not_analyzed"},
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
                            preserve_separators: true,
                            preserve_position_increments: true,
                            max_input_length: 50
                        },
                        tagSuggest: {
                            type: "completion",
                            analyzer: "simple",
                            preserve_separators: true,
                            preserve_position_increments: true,
                            max_input_length: 50
                        },
                        actorSuggest: {
                            type: "completion",
                            analyzer: "simple",
                            preserve_separators: true,
                            preserve_position_increments: true,
                            max_input_length: 50
                        },
                        characterSuggest: {
                            type: "completion",
                            analyzer: "simple",
                            preserve_separators: true,
                            preserve_position_increments: true,
                            max_input_length: 50
                        },
                        eventSuggest: {
                            type: "completion",
                            analyzer: "simple",
                            preserve_separators: true,
                            preserve_position_increments: true,
                            max_input_length: 50
                        },
                        movieSuggest: {
                            type: "completion",
                            analyzer: "simple",
                            preserve_separators: true,
                            preserve_position_increments: true,
                            max_input_length: 50
                        }
                    }
                }
                
            }, function (err, resp, respcode) {
                    if (!err) {
                        console.log('put mapping')
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
        console.log('Initing ES indext')
        client.indices.exists({index:'trolls'}, function (existErr, existData) {
            if (existData) {
                console.log('index exists', existErr, existData)
                if (callback && typeof callback === 'function') {
                    callback();
                }
                return
            } else {
                console.log('no index exists')
                client.indices.create({index: 'trolls'}, function(createErr, createData) {
                    if (!createErr) {
                    putMapping(function(err) {
                        if (!err) {
                        console.log('Putting index');
                            if (callback && typeof callback === 'function') {
                                callback();
                            }
                        } else {
                            console.log('error in putting index', err);
                        }
                    })                        

                } else {
                    console.log('Error creating index', createErr)
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
                context : doc.context,
                isApproved: doc.isApproved,
                createdAt: doc.createdAt,
                lastModified: doc.lastModified
            }
            if (doc.title) {
                body.titleSuggest = {input: doc.title.split(" ")}
            }
            if (doc.event) {
                body.eventSuggest = {input: doc.event.split(" ")}
            }
            if (doc.movie) {
                body.movieSuggest = {input: doc.movie.split(" ")}
            }
            if (doc.tags && Array.isArray(doc.tags) && doc.tags.length > 0) {
                body.tagSuggest = {input: doc.tags}
            }
            if (doc.actors && Array.isArray(doc.actors) && doc.actors.length > 0) {
                body.actorSuggest = {input: doc.actors}
            }
            if (doc.characters && Array.isArray(doc.characters) && doc.characters.length > 0) {
                body.characterSuggest = {input: doc.characters}
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
                console.error('Problem in putting doc', JSON.stringify(error),"\n body -> \n", JSON.stringify(body))
            }
            callback(error, response);
        });
    };
    var getDocs = function(options, callback) {
    var isAdvancedSearch = function (opts) {
        var opt;
        for (opt in opts) {
            if (opts[opt]) {
                return true
            }
        }
        return false;
    }
    var should_array = [],
        must_array = [],
        sort =[];
        body = {};
        
        if (options.advanced && isAdvancedSearch(options.advanced)) {           
            if (options.advanced.userId) {
                must_array.push({ "match": { "user.id": options.advanced.userId }});
                sort.push({"_score": {"order": "desc"}});
            }
            if (options.advanced.title) {
                must_array.push({ "match": { "title": options.advanced.title }});
                sort.push({"_score": {"order": "desc"}});
            }
            if (options.advanced.tags) {
                must_array.push({ "match": { "tags": options.advanced.tags }});
                sort.push({"_score": {"order": "desc"}});
            }
            if (options.advanced.movie) {
                must_array.push({ "match": { "movie": options.advanced.movie }});
                sort.push({"_score": {"order": "desc"}});
            }
            if (options.advanced.language) {
                must_array.push({ "match": { "language": options.advanced.language }});
                sort.push({"_score": {"order": "desc"}});
            }
            if (options.advanced.actors) {
                must_array.push({ "match": { "actors": options.advanced.actors }});
                sort.push({"_score": {"order": "desc"}});
            }
            if (options.advanced.characters) {
                must_array.push({ "match": { "characters": options.advanced.characters }});
                sort.push({"_score": {"order": "desc"}});
            }
            if (options.advanced.event) {
                must_array.push({ "match": { "event": options.advanced.event }});
                sort.push({"_score": {"order": "desc"}});
            }
        } else if (options.search){
            should_array.push({ "match": { "user.id": options.search}});
            should_array.push({ "match": { "title": options.search }});
            should_array.push({ "match": { "tags": options.search }});
            should_array.push({ "match": { "movie": options.search }});
            should_array.push({ "match": { "actors": options.search }});
            should_array.push({ "match": { "characters": options.search }});
            should_array.push({ "match": { "event": options.search }});
            sort.push({
                "_score": {
                   "order": "desc"
                }
             });
        } else {
            sort.push({
                    "lastModified": {
                       "order": options.order || "desc"
                    }
                 })
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
        if (options.unApproved) {
            must_array.push({ "match": { "isApproved": false }});
        } else {
            must_array.push({ "match": { "isApproved": true }});
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
               "sort" : sort
        };
        console.log('sort ', sort); 
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
                suggestObj.suggest[field]={
                    "regex" : ".*"+options.query+".*",
                    completion : {
                        field: fieldMap[field]
                    } 
                  }
            });            
        } else {
            Object.keys(fieldMap).forEach(function(field) {
                suggestObj.suggest[field]={
                    "regex" : ".*"+options.query+".*",
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
            if (error) {
                console.error(error);
            }
            callback(error, response);
        });
    }
    var updateDoc = function (id, doc, callback) {
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
            context : doc.context,
            event: doc.event,
            isApproved: doc.isApproved,
            createdAt: doc.createdAt,
            lastModified: doc.lastModified
        }
        if (doc.title) {
            body.titleSuggest = {input: doc.title.split(" ")}
        }
        if (doc.event) {
            body.eventSuggest = {input: doc.event.split(" ")}
        }
        if (doc.movie) {
            body.movieSuggest = {input: doc.movie.split(" ")}
        }
        if (doc.tags && Array.isArray(doc.tags) && doc.tags.length > 0) {
            body.tagSuggest = {input: doc.tags}
        }
        if (doc.actors && Array.isArray(doc.actors) && doc.actors.length > 0) {
            body.actorSuggest = {input: doc.actors}
        }
        if (doc.characters && Array.isArray(doc.characters) && doc.characters.length > 0) {
            body.characterSuggest = {input: doc.characters}
        }
        client.update({
            index: 'trolls',
            id: id,
            type: 'post',
            body: {
                doc: body
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

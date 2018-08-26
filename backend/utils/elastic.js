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
                        user:{"type" : "string", "index" : "not_analyzed"},
                        title: {"type" : "string", "fields": {"raw": {"type": "string","index": "not_analyzed"}}},
                        context: {"type" : "string"},
                        type: {"type" : "string", "index" : "not_analyzed"},
                        isAdult: {"type" : "boolean", "index" : "not_analyzed"},
                        isApproved: {"type" : "boolean", "index" : "not_analyzed"},
                        image: {"type" : "object", 
                            "properties" : {
                                "url" : {"type" : "string", "index" : "not_analyzed"},
                                "thumb" : {"type" : "string", "index" : "not_analyzed"},
                                "type" : {"type" : "string", "index" : "not_analyzed"}
                            }
                        },
                        descriptions: {"type" : "string"},
                        likes: {
                            properties:{
                                userId: {"type": "string", "index" : "not_analyzed"},
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
                        movie: {"type" : "string", "fields": {"raw": {"type": "string","index": "not_analyzed"}}},
                        language: {"type" : "string"},
                        actors: {"type" : "string"},
                        characters: {"type" : "string"},
                        event: {
                            properties:{
                                title: {"type" : "string"},
                                link: {"type" : "string"}
                                }
                        },
                        createdAt: {"type" : "date"},
                        lastModified: {"type": "date"},
                        titleSuggest: {
                            type: "completion",
                            analyzer: "simple",
                            preserve_separators: true,
                            preserve_position_increments: false,
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
    var putRequestMapping = function (callback) {
            client.indices.putMapping({
                index: 'trolls',
                type: 'requests',
                body:{
                    properties: {
                        user: {"type" : "string", "index" : "not_analyzed"},
                        movieName: {"type" : "string", "index" : "not_analyzed"},
                        description: {"type" : "string", "index" : "not_analyzed"},
                        link: {"type" : "string", "index" : "not_analyzed"},
                        status: {"type" : "string", "index" : "not_analyzed"},
                        isAdult: {"type" : "boolean", "index" : "not_analyzed"},
                        isApproved: {"type" : "boolean", "index" : "not_analyzed"},
                        image: {"type" : "object", 
                            "properties" : {
                                "url" : {"type" : "string", "index" : "not_analyzed"},
                                "thumb" : {"type" : "string", "index" : "not_analyzed"},
                                "type" : {"type" : "string", "index" : "not_analyzed"}
                            }
                        },
                        createdAt: {"type" : "date"},
                        lastModified: {"type": "date"},
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
        console.log('Initing ES index');
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
                            putRequestMapping((err)=> {
                                if (!err) {
                                    if (callback && typeof callback === 'function') {
                                        callback();
                                    }
                                } else {
                                    console.log('error in putting index', err);
                                    if (callback && typeof callback === 'function') {
                                        callback(err);
                                    }
                                }
                            })                            
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
                body.titleSuggest = {input: doc.title}
            }
            if (doc.event && doc.event.title) {
                body.eventSuggest = {input: doc.event.title}
            }
            if (doc.movie) {
                body.movieSuggest = {input: doc.movie}
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
            sort =[],
            minScore = undefined,
            body = {};
        
        if (options.advanced && isAdvancedSearch(options.advanced)) {           
            if (options.advanced.userId) {
                must_array.push({ "match": { "user": options.advanced.userId }});
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
                must_array.push({ "match": { "event.title": options.advanced.event }});
                sort.push({"_score": {"order": "desc"}});
            }
        } else if (options.search){
            should_array.push({ "match": { "user": options.search}});
            should_array.push({ "match": { "title": options.search }});
            should_array.push({ "match": { "tags": options.search }});
            should_array.push({ "match": { "movie": options.search }});
            should_array.push({ "match": { "actors": options.search }});
            should_array.push({ "match": { "characters": options.search }});
            should_array.push({ "match": { "event.title": options.search }});
            minScore = 0.5;
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
        if (options.context) {
            must_array.push({ "match": { "context": options.context }});
        }
        if (options.language) {
            must_array.push({ "match": { "language": options.language }});
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
        if (minScore) {
            body.min_score = minScore;
        }
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
            callback(error, response.hits);
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
                /*if (field === 'title' || field === 'movie' ||field === 'event' ) {
                    suggestObj.suggest[field]={
                        "prefix" : options.query,
                        completion : {
                            field: fieldMap[field]
                        } 
                      }
                } else { */
                    suggestObj.suggest[field]={
                        "regex" : ".*"+options.query+".*",
                        completion : {
                            field: fieldMap[field]
                        } 
                      }
                //}
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
            console.log('response \n' + JSON.stringify(response) + '\n')
            callback(error, response);
        });
    }
    var getRequestSuggestions = function(options, callback) {
        var fieldMap = {
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
                /*if (field === 'title' || field === 'movie' ||field === 'event' ) {
                    suggestObj.suggest[field]={
                        "prefix" : options.query,
                        completion : {
                            field: fieldMap[field]
                        } 
                      }
                } else { */
                    suggestObj.suggest[field]={
                        "regex" : ".*"+options.query+".*",
                        completion : {
                            field: fieldMap[field]
                        } 
                      }
                //}
            });         
        }
        console.log('\n' + JSON.stringify(suggestObj) + '\n')
        client.search({
            index: 'trolls',
            type: 'request',
            body: suggestObj
        }, function (error, response) {
            if (error) {
                console.error(error);
            }
            console.log('response \n' + JSON.stringify(response) + '\n')
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
            body.titleSuggest = {input: doc.title}
        }
        if (doc.event && doc.event.title) {
            body.eventSuggest = {input: doc.event.title}
        }
        if (doc.movie) {
            body.movieSuggest = {input: doc.movie}
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
        console.log("es body\n", body)
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
    var deletDoc = function (id, callback) {
        client.delete({
          index: 'trolls',
          type: 'post',
          id: id,
        }, function (error, response) {
           callback(error, response)
        });
    }
    var deleteRequestDoc = function (id, callback) {
        client.delete({
          index: 'trolls',
          type: 'request',
          id: id,
        }, function (error, response) {
           callback(error, response)
        });
    }
    var updateRequestDoc = function (id, doc, callback) {
            var body = {
                user: doc.user,
                movieName: doc.movieName,
                language: doc.language,
                description : doc.description,
                image: doc.image,
                descriptions: doc.descriptions,
                link: doc.link,
                status: doc.status,
                image: doc.image
            }
            if (doc.movieName) {
                body.movieSuggest = {input: doc.movieName}
            }
            body.createAt = date.createdAt;
            body.lastUpdated = date.lastUpdated
        console.log("es body\n", body)
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
    var putRequestDoc = function (doc, callback) {
        var body = {
                user: doc.user,
                movieName: doc.movieName,
                language: doc.language,
                description : doc.description,
                image: doc.image,
                descriptions: doc.descriptions,
                link: doc.link,
                status: doc.status,
                image: doc.image
            }
            if (doc.movieName) {
                body.movieSuggest = {input: doc.movieName}
            }
            body.createAt = date.createdAt;
            body.lastUpdated = date.lastUpdated
        client.create({
            index: 'trolls',
            id: doc.id,
            type: 'request',
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
    var getRequestDocs = function(options, callback) {
        var must_array = [],
            sort =[],
            minScore = 0.5,
            body = {};
        if (options.language) {
                must_array.push({ "match": { "language": options.language}});
        }
        if (options.movieName) {
                must_array.push({ "match": { "moveName": options.movieName}});
        }
        if (options.language || options.movieName) {
            sort.push({
                "_score": {
                   "order": "desc"
                }
             });
        } else {
            sort.push({
                "lastUpdated": {
                   "order": options.order || "desc"
                }
             })
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
        if (minScore) {
            body.min_score = minScore;
        }
        console.log('sort ', sort); 
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
            type: 'request',
            body: body
        }, function (error, response) {
            callback(error, response.hits);
        });
    }
    return {
        init: init,
        putDoc: putDoc,
        putRequestDoc: putRequestDoc,
        getDocs: getDocs,
        getRequestDocs: getRequestDocs,
        updateDoc: updateDoc,
        updateRequestDoc: updateRequestDoc,
        getSuggestions: getSuggestions,
        getRequestSuggestions: getRequestSuggestions,
        deletDoc: deletDoc,
        deleteRequestDoc: deleteRequestDoc
    }
}

module.exports = elastic()

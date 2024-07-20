const elasticsearch = require('@elastic/elasticsearch')
const config = require('../config.js');
var client = new elasticsearch.Client({ node: `http://${config.esHost}:${config.esPort}` });
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
                        user:{"type" : "text", "index" : false},
                        title: {"type" : "text", "fields": {"raw": {"type": "text","index": false}}},
                        context: {"type" : "text"},
                        requestId: {"type" : "text"},
                        isApproved: {"type" : "boolean"},
                        image: {"type" : "object",
                            "properties" : {
                                "url" : {"type" : "text", "index" : false},
                                "thumb" : {"type" : "text", "index" : false},
                                "weburl" : {"type" : "text", "index" : false},
                                "type" : {"type" : "text", "index" : false}
                            }
                        },
                        descriptions: {"type" : "text"},
                        likes: {
                            properties:{
                                userId: {"type": "text", "index" : false},
                                time:  {"type": "date"}
                            }
                        },
                        views: { 
                            properties:{
                                user: {"type": "text"},
                                time: {"type": "date"}
                            }
                        },
                        downloads: { 
                            properties:{
                                user: {"type": "text"},
                                time: {"type": "date"}
                            }
                        },
                        comments:{
                            properties:{
                                userId: {"type": "text", "index" : false},
                                comment:  {"type": "text"},
                                createdAt: {"type": "date"}
                            }
                        },
                        tags: {"type" : "text"},
                        movie: {"type" : "text", "fields": {"raw": {"type": "text","index": false}}},
                        language: {"type" : "text"},
                        actors: {"type" : "text"},
                        characters: {"type" : "text"},
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
    var putRequestMapping = function () {
        client.indices.putMapping({
            index: 'trolls',
            type: 'requests',
            body:{
                properties: {
                    requestUser: {"type" : "text", "index" : false},
                    requestmovie:{"type" : "text", "index" : false},
                    requestTitle: {"type" : "text"},
                    requestDescription: {"type" : "text", "index" : false},
                    requestLink: {"type" : "text", "index" : false},
                    requestStatus: {"type" : "text", "index" : false},
                    requestPostId: {"type" : "text", "index" : false},
                    requestIsApproved: {"type" : "boolean", "index" : false},
                    requestImage: {"type" : "object",
                        "properties" : {
                            "url" : {"type" : "text", "index" : false},
                            "weburl" : {"type" : "text", "index" : false},
                            "thumb" : {"type" : "text", "index" : false},
                            "type" : {"type" : "text", "index" : false}
                        }
                    },
                    requestCreatedAt: {"type" : "date"},
                    requestLastUpdated: {"type": "date"},
                    requestMovieSuggest: {
                        type: "completion",
                        analyzer: "simple",
                        preserve_separators: true,
                        preserve_position_increments: true,
                        max_input_length: 50
                    },
                    requestTitleSuggest: {
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
                console.log('put request mapping')
                callback()
            } else {
                console.error(err);
                callback(err);
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
                            /*putRequestMapping((err)=> {
                                if (!err) {*/
                                    if (callback && typeof callback === 'function') {
                                        callback();
                                    }
                               /* } else {
                                    console.log('error in putting index', err);
                                    if (callback && typeof callback === 'function') {
                                        callback(err);
                                    }
                                }
                            })*/
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
    var putDoc = async function (doc, callback) {
    var body = {
                user: doc.user,
                title: doc.title,
                image: doc.image,
                descriptions: doc.descriptions,
                tags: doc.tags,
                movie: doc.movie,
                language: doc.language,
                actors: doc.actors,
                likes: doc.likes || [],
                downloads: doc.downloads || [],
                shares: doc.shares || [],
                views : doc.views || [],
                characters: doc.characters,
                comments: doc.comments,
                context : doc.context,
                requestId: doc.requestId,
                isApproved: doc.isApproved,
                createdAt: doc.createdAt,
                lastModified: doc.lastModified
            }
            if (doc.title) {
                body.titleSuggest =  doc.title
            }
            if (doc.event && doc.event.title) {
                body.eventSuggest = doc.event.title
            }
            if (doc.movie) {
                body.movieSuggest = doc.movie
            }
            if (doc.tags && Array.isArray(doc.tags) && doc.tags.length > 0) {
                body.tagSuggest = doc.tags
            }
            if (doc.actors && Array.isArray(doc.actors) && doc.actors.length > 0) {
                body.actorSuggest = doc.actors
            }
            if (doc.characters && Array.isArray(doc.characters) && doc.characters.length > 0) {
                body.characterSuggest = doc.characters
            }
            const _doc  = await client.index({
                index: 'trolls',
                id: doc.id,
                document: body
            })
        console.log(_doc)
        callback(undefined, _doc)
        /*client.index({
            index: 'trolls',
            id: doc.id,
            document: body
        }, function (error, response) {
            if (!error) {
                console.log('Put document ' + response._id);
            } else {
                console.error('Problem in putting doc', JSON.stringify(error),"\n body -> \n", JSON.stringify(body))
            }
            callback(error, response);
        });*/
    };
    var getDocs =  function(options) {
        return new Promise(async(resolve, reject) => {
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
                query=''
               
            if (options.advanced && isAdvancedSearch(options.advanced)) {
                console.log('>> advanced', options.advanced)

                if (options.advanced.userId) {
                    must_array.push({ "match": { "user": options.advanced.userId }});
                    //should_array.push("user")
                    //query=options.advanced.userId
                    sort.push({"_score": {"order": "desc"}});
                }
                if (options.advanced.title) {
                    must_array.push({ "match": { "title": options.advanced.title }});
                    sort.push({"_score": {"order": "desc"}});
                    //should_array.push("title")
                    //query=options.advanced.title 
                }
                if (options.advanced.tags) {
                    if (Array.isArray(options.advanced.tags)) {
                        options.advanced.tags.forEach(tag=> {
                            must_array.push({ "match": { "tags": tag }})
                        })
                    } else {
                        must_array.push({ "match": { "tags": options.advanced.tags }});  
                    }
                    //must_array.push({ "match": { "tags": options.advanced.tags }});
                    //should_array.push("tags")
                    //query=options.advanced.tags 
                    sort.push({"_score": {"order": "desc"}});
                }
                if (options.advanced.movie) {
                    must_array.push({ "match": { "movie": options.advanced.movie }});
                    //should_array.push("movie")
                    //query=options.advanced.movie 
                    sort.push({"_score": {"order": "desc"}});
                }
                if (options.advanced.language) {
                    must_array.push({ "match": { "language": options.advanced.language }});
                    //should_array.push("language")
                    //query=options.advanced.language 
                    sort.push({"_score": {"order": "desc"}});
                }
                if (options.advanced.actors) {
                    if (Array.isArray(options.advanced.actors)) {
                        options.advanced.actors.forEach(actor => {
                            must_array.push({ "match": { "actors": actor }})
                        })
                    } else {
                        must_array.push({ "match": { "actors": options.advanced.actors }});  
                    }
                    //must_array.push({ "match": { "actors": options.advanced.actors }});
                    //should_array.push("actors")
                    //query=options.advanced.actors 
                    sort.push({"_score": {"order": "desc"}});
                }
                if (options.advanced.characters) {
                    if (Array.isArray(options.advanced.characters)) {
                        options.advanced.characters.forEach(char => {
                            must_array.push({ "match": { "characters": char }})
                        })
                    } else {
                        must_array.push({ "match": { "characters": options.advanced.characters }});
                    }
                    //must_array.push({ "match": { "characters": options.advanced.characters }});
                    //should_array.push("characters")
                    //query=options.advanced.characters 
                    sort.push({"_score": {"order": "desc"}});
                }
            } else if (options.search){
                query = options.search
                /*should_array.push({ "match": { "user": options.search}});
                should_array.push({ "match": { "title": options.search }});
                should_array.push({ "match": { "tags": options.search }});
                should_array.push({ "match": { "movie": options.search }});
                should_array.push({ "match": { "actors": options.search }});
                should_array.push({ "match": { "characters": options.search }});*/
                should_array=['user', 'title', 'tags', 'movie', 'actors', 'characters']
                minScore = 0.5;
                sort.push({
                    "_score": {
                       "order": "asc"
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
            if (options.context) {
                must_array.push({ "match": { "context": options.context }});
            }
            if (options.language) {
                must_array.push({ "match": { "language": options.language }});
            }
            if (options.unApproved) {
                must_array.push({ "match": { "isApproved": false }});
            } else {
                must_array.push({ "match": { "isApproved": true }});
            }
            /*body = {
                aggs : {
                    posts:{
                       top_hits:{
                         size:options.size || 10
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
                   "size" : options.size || 10,
                   "sort" : sort
            };*/
            body = {
                "query": {
                    "bool": {},
                },
                "from" : options.from || 0,
                "size" : options.size || 10,
                "sort" : sort
            };
            /*body["_source"]: {
                excludes: [ "downloads", "likes", "shares" ]
            }*/
            if (minScore) {
                body.min_score = minScore;
            }
            console.log('sort ', sort, query, should_array);
            if (should_array.length > 0 && query) {
                body.query.bool.should = {
                    "multi_match": {
                        "query": query,
                        "type":"phrase",
                        "fields": should_array
                    }
                                
                }
                body.query.bool.minimum_should_match=1
            }
            //if (should_array.length > 0) {
                body.query.bool.must = must_array
            //}
            console.log('options\n');
            console.log(JSON.stringify(options));
            console.log('options Ends\n');
            console.log('Search Query\n');
            console.log(JSON.stringify(body, null, 4));
            console.log('Search Query Ends\n');
            try {
                const result = await client.search({
                    index: 'trolls',
                    body: body
                })
                console.log(result)
                resolve(result.hits);
            } catch (e) {
                console.log(`Error in getting search ${e}`)
                reject(e)
            }

        });
    };
    var getSuggestions = async function(options, callback) {
        var fieldMap = {
            title: 'titleSuggest',
            tags: 'tagSuggest',
            actors: 'actorSuggest',
            characters: 'characterSuggest',
            movie: 'movieSuggest'
        };
        const reverseFieldMap = {
            tag: 'tags',
            tags: 'tags',
            actor: 'actors',
            actors: 'actors',
            character: 'characters',
            characters: 'characters',
            movie: 'movie',
            title: 'title',
        };

        let mappedField  = [];
        if (!options.fields) {
            options.fields=['title', 'tags', 'actors', 'characters', 'movie']
        }
        console.log('>>', options)
        if (Array.isArray(options.fields) && options.fields.length > 0) {
            options.fields = options.fields.map(x=>reverseFieldMap[x])
            mappedField = options.fields.map(x=>fieldMap[x])

        } else {
            mappedField = option.fields
            options.fields=[options.field];
        }
        /*let query = {
            "query": {
                "multi_match": {
                    "query": options.query,
                    "type": "bool_prefix", 
                    "fields": [
                      "titleSuggest",
                      "tagSuggest",
                      "actorSuggest",
                      "characterSuggest",
                      "movieSuggest"
                    ]
                  }
            }
          }*/
        const query = {
            "_source":options.fields,
            "query": {
                "multi_match" : {
                    "query":    options.query,
                    "type":"cross_fields",
                    "fields": mappedField 
                }
            },
            "highlight": {
                "fields" : {
                    "titleSuggest" : {},
                    "movieSuggest": {},
                    "characterSuggest":{},
                    "actorSuggest":{},
                    "tagSuggest": {}
                }
            }
        }
        console.log('\n' + JSON.stringify(query) + '\n')
        try {
            const data = await client.search({
                index: 'trolls',
                body: query
            })
            console.log(data)
            callback(undefined, data);
        } catch (e) {
            console.log(e)
            callback(e, undefined)
        }
    }
    var getRequestSuggestions = function(options, callback) {
        var fieldMap = {
            movie: 'requestMovieSuggest'
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
            index: 'requests',
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
            image: doc.image,
            descriptions: doc.descriptions,
            tags: doc.tags,
            movie: doc.movie,
            language: doc.language,
            actors: doc.actors,
            likes: doc.likes || [],
            downloads: doc.downloads || [],
            shares: doc.shares || [],
            views : doc.views || [],
            characters: doc.characters,
            comments: doc.comments,
            context : doc.context,
            isApproved: doc.isApproved,
            createdAt: doc.createdAt,
            lastModified: doc.lastModified
        }
        if (doc.title) {
            body.titleSuggest = {input: doc.title}
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
            refresh:true,
            body: {
                doc: body
            }
        }, function(err, data){
            if (callback && typeof callback === 'function') {
                callback(err, data);
            }
        });
    }
    var deletDoc = async function (id, callback) {
        try {
            const resp = await client.delete({
              index: 'trolls',
              id: id,
              refresh:true,
            })
            callback(undefined, resp)
        } catch (e) {
            callback(e, undefined)
        }
    }
    var deleteRequestDoc = function (id, callback) {
        client.delete({
          index: 'requests',
          refresh:true,
          type: 'request',
          id: id,
        }, function (error, response) {
           callback(error, response)
        });
    }
    var updateRequestDoc = function (id, doc, callback) {
        let body = {};
        if (doc.movie) {
            body.requestMovie = doc.movie;
            body.requestMovieSuggest = {input: doc.movie}
        }
        if (doc.title) {
            body.requestTitle = doc.title;
            body.requestTitleSuggest = {input: doc.title}
        }
        if (doc.description) {
            body.requestDescription = doc.description;
        }
        if (doc.link) {
            body.requestLink = doc.link;
        }
        if (doc.movie) {
            body.requestLanguage = doc.language;
        }
        body.requestLastUpdated = doc.dates.lastUpdated;
        console.log("es body\n", body)
        client.update({
            index: 'requests',
            id: id,
            refresh:true,
            type: 'request',
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
                requestUser: doc.user,
                requestMovie: doc.movie,
                requestLanguage: doc.language,
                requestDescription : doc.description,
                requestImage: doc.image,
                requestTitle: doc.title,
                requestLink: doc.link,
                requestStatus: doc.status,
            }
            if (doc.movie) {
                body.requestMovieSuggest = {input: doc.movie}
            }
            if (doc.title) {
                body.requestTitleSuggest = {input: doc.title}
            }
            body.requestCreateAt = doc.dates.createdAt;
            body.requestLastUpdated = doc.dates.lastUpdated
        client.create({
            index: 'requests',
            id: doc.id,
            type: 'request',
            refresh: true,
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
                must_array.push({ "match": { "requestLanguage": options.language}});
        }
        if (options.movie) {
                must_array.push({ "match": { "requestMovie": options.movie}});
        }
        must_array.push({ "match": { "requestStatus": "P"}});
        if (options.requestLanguage || options.requestMovie) {
            sort.push({
                "_score": {
                   "order": "desc"
                }
             });
        } else {
            sort.push({
                "requestLastUpdated": {
                   "order": options.order || "desc"
                }
             })
        }
        /* body = {
            aggs : {
                requests:{
                   top_hits:{
                     size:10
                   }
                 }
            },
            query: {
                bool: {
                    must:must_array,
                }
              },
               "from" : options.from || 0,
               "size" : 10,
               "sort" : sort
        };*/
        body = {
          "query": {
            "bool" : {
              "must" : must_array
            }
          },
           "from" : options.from || 0,
           "size" : 10,
           "sort" : sort
        }
        /*if (minScore) {
            body.min_score = minScore;
        }*/
        console.log('options\n');
        console.log(JSON.stringify(options));
        console.log('options Ends\n');
        console.log('Search Query\n');
        console.log(JSON.stringify(body));
        console.log('Search Query Ends\n');
        client.search({
            index: 'requests',
            type: 'request',
            body: body
        }, function (error, response) {
            console.log("\n", JSON.stringify(response), "\n")
            //callback(error, response.aggregations.requests.hits);
            callback(error, response.hits);
        });
    }
    let updateRequestOnResponse = (requestId, postId) => {
        return new Promise((resolve, reject)=>{
            client.update({
                index: 'requests',
                id: requsetId,
                refresh:true,
                type: 'request',
                body: {
                    doc: {"status":"R", "requestPostId": postId}
                }
            }, function(err, data){
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        }) 
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

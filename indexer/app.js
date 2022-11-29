var MongoClient = require('mongodb').MongoClient;
var WritableBulk = require('elasticsearch-streams').WritableBulk;
var TransformToBulk = require('elasticsearch-streams').TransformToBulk;
const split = require('split2')
const mongoHost = process.env.MONGO_HOST || '192.168.18.6';
const mongoPort = process.env.MONGO_PORT || '27017';
const esHost = process.env.ES_HOST || '192.168.18.6';
const esPort = process.env.ES_PORT || '9200';
const mongodbUrl = `mongodb://${mongoHost}:${mongoPort}/trolls` ;
const esUrl = `${esHost}:${esPort}`;
const elasticsearch = require('@elastic/elasticsearch')
//var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({ node: 'http://192.168.18.6:9200' });
var deleteIndex;
var putMapping;
var Transform = require('stream').Transform,
    util = require('util');


const toB =  (doc) => {
    var id = doc._id.toString();
    delete doc._id
    if (doc.title) {
        doc.titleSuggest =  doc.title
    }
    if (doc.movie) {
        doc.movieSuggest = doc.movie
    }
    if (doc.tags && Array.isArray(doc.tags) && doc.tags.length > 0) {
        doc.tagSuggest = doc.tags
    }
    if (doc.actors && Array.isArray(doc.actors) && doc.actors.length > 0) {
        doc.actorSuggest = doc.actors
    }
    if (doc.characters && Array.isArray(doc.characters) && doc.characters.length > 0) {
        doc.characterSuggest =  doc.characters
    }
    return doc
}

const toChars = (doc) => {
    return doc.characters.map(x=>{return {name:x, charSuggest:x}})
}
const toActors = (doc) => {
    return doc.characters.map(x=>{return {name:x, charSuggest:x}})
}
deleteIndex =  async(indexName) => {
    console.log(`Deleting ${indexName}`)
    try {
        await client.indices.delete({index: indexName})
        console.log(`Deleted ${indexName}`)
        return
    } catch (e) {
        if (e.statusCode !== 404) {
            throw e;
        } else {
            console.log(`Index ${indexName} is not found`)
            return
        }
    }        

}
const createIndex =  async(indexName) => {
    console.log(`Creating index ${indexName}`)
    const trollsMap = {
        "properties": {
            "user": {
                "type": "text"
            },
            "title": {
                "type": "text"
            },
            "context": {
                "type": "text"
            },
            "requestId": {
                "type": "text"
            },
            "isApproved": {
                "type": "boolean"
            },
            "image": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "text"
                    },
                    "weburl": {
                        "type": "text"
                    },
                    "type": {
                        "type": "text"
                    },
                    "thumb": {
                        "type": "text"
                    },
                    "size": {
                        "type": "object",
                        "properties": {
                            "width": {
                                "type": "long"
                            },
                            "height": {
                                "type": "long"
                            }
                        }
                    }
                }
            },
            "descriptions": {
                "type": "text"
            },
            "likes": {
                "properties": {
                    "userId": {
                        "type": "text"
                    },
                    "time": {
                        "type": "date"
                    }
                }
            },
            "views": {
                "properties": {
                    "user": {
                        "type": "text"
                    },
                    "time": {
                        "type": "date"
                    }
                }
            },
            "downloads": {
                "properties": {
                    "user": {
                        "type": "text"
                    },
                    "time": {
                        "type": "date"
                    }
                }
            },
            "shares": {
                "properties": {
                    "user": {
                        "type": "text"
                    },
                    "time": {
                        "type": "date"
                    }
                }
            },
            "comments": {
                "properties": {
                    "userId": {
                        "type": "text"
                    },
                    "comment": {
                        "type": "text"
                    },
                    "createdAt": {
                        "type": "date"
                    }
                }
            },
            "tags": {
                "type": "text"
            },
            "movie": {
                "type": "text"
                },
            "language": {
                "type": "text"
            },
            "actors": {
                "type": "text"
            },
            "characters": {
                "type": "text"
            },
            "createdAt": {
                "type": "date"
            },
            "lastModified": {
                "type": "date"
            },
            "titleSuggest": {
                    "type": "text",
            "analyzer": "autocomplete",
            "search_analyzer": "autocomplete_search"
            },
            "tagSuggest": {
                    "type": "text",
            "analyzer": "autocomplete",
            "search_analyzer": "autocomplete_search"
            },
            "actorSuggest": {
                "type": "text",
            "analyzer": "autocomplete",
            "search_analyzer": "autocomplete_search"
            },
            "characterSuggest": {
                "type": "text",
            "analyzer": "autocomplete",
            "search_analyzer": "autocomplete_search"
            },
            "movieSuggest": {
                "type": "text",
          "analyzer": "autocomplete",
          "search_analyzer": "autocomplete_search"
            }
        }
    }
    const charMap = {
        properties: {
            name:{"type" : "text"},
            charSuggest: {
                type: "search_as_you_type",
                max_shingle_size: 3
            }
        }
    };
    const actorMap = {
        properties: {
            name:{"type" : "text"},
            actorSuggest: {
                type: "search_as_you_type",
                max_shingle_size: 3
            }
        }
    };
    let map
    if (indexName === 'trolls') {
        map = trollsMap
    } else if (indexName === 'chars') {
        map = charMap
    }
    else if (indexName === 'actors') {
        map = actorMap
    }
    try {
        const resp = await client.indices.create({
            index: indexName,
            "settings": {
                "analysis": {
                  "analyzer": {
                    "autocomplete": {
                      "tokenizer": "autocomplete",
                      "filter": [
                        "lowercase"
                      ]
                    },
                    "autocomplete_search": {
                      "tokenizer": "lowercase"
                    }
                  },
                  "tokenizer": {
                    "autocomplete": {
                      "type": "edge_ngram",
                      "min_gram": 2,
                      "max_gram": 10,
                      "token_chars": [
                        "letter"
                      ]
                    }
                  }
                }
              },
            mappings: map
        }, { ignore: [400] })
        console.log('>', resp);
        return resp;
    } catch (e) {
        if(e.body.error.type === 'resource_already_exists_exception') {
            return
        }
        throw e
    }
}
/*var putRequestMapping = function () {
    return new Promise((resolve, reject) => {
        client.indices.putMapping({
            index: 'requests',
            type: 'request',
            body:{
                properties: {
                    requestUser: {"type" : "text"},
                    requestMovie:{"type" : "text"},
                    requestTitle: {"type" : "text"},
                    requestDescription: {"type" : "text"},
                    requestLink: {"type" : "text"},
                    requestStatus: {"type" : "text"},
                    requestIsApproved: {"type" : "boolean"},
                    requestImage: {"type" : "object",
                        "properties" : {
                            "url" : {"type" : "text"},
                            "weburl" : {"type" : "text"},
                            "thumb" : {"type" : "text"},
                            "type" : {"type" : "text"}
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
                resolve(resp)
            } else {
                console.error(err);
                reject(err);
            }
        });
    })
}*/
/*var putMapping = function () {
    return new Promise(function (resolve, reject) {
        console.log(`Putting Mapping`)
        client.indices.putMapping({
            index: 'trolls',
            type: 'post',
            body:{
                properties: {
                    user: {"type" : "text"},
                    title: {"type" : "text", "fields": {"raw": {"type": "text"}}},
                    context: {"type" : "text"},
                    requestId: {"type" : "text"},
                    isApproved: {"type" : "boolean"},
                    image: {"type" : "object",
                        "properties" : {
                            "url"   : {"type" : "text"},
                            "weburl"   : {"type" : "text"},
                            "type"  : {"type" : "text"},
                            "thumb" : {"type" : "text"},
                            "size"  : {"type" : "object","properties" :
                                {
                                "width": {"type": "long"},
                                "height":{"type": "long"}
                                }
                            }
                        }
                    },
                    descriptions: {"type" : "text"},
                    likes: {
                        properties:{
                            userId: {"type": "text"},
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
                    shares: { 
                        properties:{
                            user: {"type": "text"},
                            time: {"type": "date"}
                        }
                    },
                    comments:{
                        properties:{
                            userId: {"type": "text"},
                            comment:  {"type": "text"},
                            createdAt: {"type": "date"}
                        }
                    },
                    tags: {"type" : "text"},
                    movie: {"type" : "text", "fields": {"raw": {"type": "text"}}},
                    language: {"type" : "text"},
                    actors: {"type" : "text"},
                    characters: {"type" : "text"},
                    createdAt: {"type" : "date"},
                    lastModified: {"type": "date"},
                    titleSuggest: {
                        type: "search_as_you_type",
                    },
                    tagSuggest: {
                        type: "search_as_you_type",
                    },
                    actorSuggest: {
                        type: "search_as_you_type",
                    },
                    characterSuggest: {
                        type: "search_as_you_type",
                    },
                    movieSuggest: {
                        type: "search_as_you_type",
                    }
                }
            }
    }, function (err, resp, respcode) {
            if (!err) {
                console.log('put new mapping')
                resolve(resp)
            } else {
               reject(err);
            }
        });
    });
}*/
console.log(mongodbUrl)
MongoClient.connect(mongodbUrl, function(err, db) {
    console.log("Connected successfully to server");
    deleteIndex("trolls")
    .then(function () {
        return createIndex("trolls")
    })
    .then(()=> {
        return createIndex("chars")
    })
    .then(()=> {
        return createIndex("actors")
    })
    .then(async () => {

            console.log('[Bluk insert post]')
            /*let bulkExec = function(bulkCmds, callback) {
              client.bulk({
                index : "trolls",
                body  : bulkCmds
              }, callback);
            };

            var collection = db.collection('posts');
            //var stream = collection.find().batchSize(2).stream();
            let ws = new WritableBulk(bulkExec);
            collection.find().batchSize(10).stream().pipe(toB).pipe(ws).on('finish', function(){console.log("done"); resolve()})
            ws.on('close', function () {
                console.log("post ws closed");
                //client.close();
                resolve()
            });
            ws.on('error', function (err) {
                console.log(err);
                //client.close();
                reject()
            });*/
            var collection = db.collection('posts');
            try {
            const result = await client.helpers.bulk({
                datasource: collection.find().batchSize(10).stream(),
                onDocument (doc) {
                    const id = doc._id.toString();
                    const tDoc = toB(doc)
                    const cDoc = toChars(doc)
                    const aDoc = toActors(doc)
                    let retObj = [];
                    retObj.push({create: { _index: 'trolls', "_id" :id }, tDoc })
                    cDoc.forEach(x=>{
                        retObj.push({create: { _index: 'chars'}, x })
                    })
                    aDoc.forEach(x=>{
                        retObj.push({create: { _index: 'actors'}, x })
                    })
                  //return retObj;
                  
                    return {create: { _index: 'trolls', "_id" :id }, tDoc }
                }
              })
              console.log(result)
            } catch (e) {
                console.log(e)
            }
            
        
     })
     /*.then(()=> {
        return new Promise((resolve, reject) => {
            console.log('[Bluk insert request]')
            var collection = db.collection('requests');
            var esTransformStream = function() {
              Transform.call(this, {objectMode: true});
            };
            util.inherits(esTransformStream, Transform);
            esTransformStream.prototype._transform = function(chunk, encoding, callback) {
                let toObj = {};
                console.log(chunk);
                if (typeof chunk.originalValue === 'undefined') {
                    chunk.originalValue = chunk.value;
                }
               if (chunk.user) {
	            toObj.requestUser = chunk.user;
                }
               if (chunk.movie) {
	            toObj.requestMovie = chunk.movie;
	            toObj.requestMovieSuggest = {input: chunk.movie};
                }
               if (chunk.title) {
	            toObj.requestTitle = chunk.title;
	            toObj.requestTitleSuggest = {input: chunk.title};
                }
               if (chunk.description) {
	            toObj.requestDescription = chunk.description;
                }
               if (chunk.link) {
	            toObj.requestLink = chunk.link
                }
               if (chunk.status) {
	            toObj.requestStatus = chunk.status
                }
               if (chunk.isApproved) {
	            toObj.requestIsApproved = chunk.isApproved
                }
               if (chunk.image) {
	            toObj.requestImage = chunk.image
                }
               if (chunk.dates.createdAt) {
	            toObj.requestCreatedAt = chunk.dates.createdAt
                }
               if (chunk.dates.lastUpadtedAt) {
	            toObj.requestLastUpdated = chunk.lastUpdatedAt
                }
                toObj._id = chunk._id;
              //this.push(toObj);
              callback(null, toObj);
            };
            let bulkExec = function(bulkCmds, callback) {
              client.bulk({
                index : "trolls",
                type  : "request",
                body  : bulkCmds
              }, callback);
            };
            let es = new esTransformStream();
            let ws = new WritableBulk(bulkExec);
            //var stream = collection.find().batchSize(2).stream();
            var torB = new TransformToBulk(function getIndexTypeId (doc) {
                var id = doc._id
                delete doc._id
                return {_id: id, _index:"requests", _type:"request"}
            })
            collection.find().batchSize(10).stream().pipe(es).pipe(torB).pipe(ws).on('finish', function(){console.log("done"); resolve()})
            ws.on('close', function () {
                console.log("request ws closed");
                //client.close();
              //  resolve()
            });
            ws.on('error', function (err) {
                console.log('Error in writing requests', err);
                //client.close();
                reject()
            });
        })
     })*/
     .then(()=> {
         console.log(`Done`)
     })
    .catch(function (err) {
        //console.error(err);
    })
});


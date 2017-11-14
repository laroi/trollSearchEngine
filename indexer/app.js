var MongoClient = require('mongodb').MongoClient;
var WritableBulk = require('elasticsearch-streams').WritableBulk;
var TransformToBulk = require('elasticsearch-streams').TransformToBulk;
var url = 'mongodb://localhost:27017/trolls';
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'info',
  apiVersion: '5.5'
});
var deleteIndex;
var createIndex;
var putMapping;

var bulkExec = function(bulkCmds, callback) {
  client.bulk({
    index : "trolls",
    type  : "post",
    body  : bulkCmds
  }, callback);
};

var ws = new WritableBulk(bulkExec);
var toB = new TransformToBulk(function getIndexTypeId (doc) {
    var id = doc._id
    delete doc._id
    if (doc.title) {
        doc.titleSuggest = {input: doc.title}
    }
    if (doc.event) {
        doc.eventSuggest = {input: doc.event}
    }
    if (doc.movie) {
        doc.movieSuggest = {input: doc.movie}
    }
    if (doc.tags && Array.isArray(doc.tags) && doc.tags.length > 0) {
        doc.tagSuggest = {input: doc.tags}
    }
    if (doc.actors && Array.isArray(doc.actors) && doc.actors.length > 0) {
        doc.actorSuggest = {input: doc.actors}
    }
    if (doc.characters && Array.isArray(doc.characters) && doc.characters.length > 0) {
        doc.characterSuggest = {input: doc.characters}
    }
    return {_id: id, _index:"trolls", _type:"post"}
})

deleteIndex = function (indexName) {
    return new Promise(function (resolve, reject) {
        client.indices.delete({index: indexName}, function (err, data) {
            if (!err) {
                console.log('deleted index')
                resolve(data)
            } else {
                reject(data);
            }
        })
    })
}
createIndex = function (indexName) {
    return new Promise(function (resolve, reject) {
        client.indices.create({index: indexName}, function (err, data) {
            if (!err) {
                console.log('created index')
                resolve(data)
            } else {
                reject(data);
            }        
        })
    });
}

var putMapping = function () {
    return new Promise(function (resolve, reject) {
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
                console.log('put new mapping')
                resolve(resp)
            } else {
               reject(err);
            }
        });
    });
}
MongoClient.connect(url, function(err, db) {
    console.log("Connected successfully to server");
    deleteIndex("trolls")
    .then(function () {
        return createIndex("trolls")
    })
    .then(putMapping)
    .then(function () {
        var collection = db.collection('posts');
        //var stream = collection.find().batchSize(2).stream();
        collection.find().batchSize(10).stream().pipe(toB).pipe(ws).on('finish', function(){console.log("done")})
        ws.on('close', function () {
        console.log("ws closed");
  client.close();
});
        ws.on('error', function (err) {
        console.log(err);
  client.close();
});
        /*stream.on('end', function() {
            console.log("Finished Streaming");
            ws.on('close', function () {
                console.log("fininshed piping");
                client.close();
            });
        });
        stream.on('data', function(data) {
            var bulk = [];
            bulk.push(toBulk(data))
        });*/
     })
    .catch(function (err) {
        console.error(err);
    })
});


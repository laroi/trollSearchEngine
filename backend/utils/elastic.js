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
                    imageUrl: {"type" : "string", "index" : "not_analyzed"},
                    descriptions: {"type" : "string"},
                    tags: {"type" : "string"},
                    movie: {"type" : "string"},
                    actors: {"type" : "string"},
                    characters: {"type" : "string"},
                    event: {"type" : "string"},
                    createdAt: {"type" : "date"}
                }
            },
            function(err, resp, respcode) {
                if (!err) {
                    callback()
                    return;
                } else {
                    console.error(err);
                    callback(err);
                    return;
                }
            }
            
        });
    }
    var init = function (callback) {
        client.indices.exists({index:'index'}, function (existErr, existData) {
            if (existData) {
                callback();
                return
            } else {
                client.indices.create({index: 'trolls'}, function(createErr, createData) {
                    if (!createErr) {
                        putMapping(function(err) {
                            if (!err) {
                                callback();
                            }
                        })
                    }
                })
            }
        });
    };
    var putDoc = function (doc, callback) {
        client.create({
            index: 'index',
            type: 'post',
            body: {
                userId: doc.userId,
                title: doc.title,
                type: doc.type,
                imageUrl: doc.imageUrl,
                descriptions: doc.descriptions,
                tags: doc.tags,
                movie: doc.movie,
                actors: doc.actors,
                characters: doc.characters,
                event: doc.event,
                createdAt: doc.createdAt
            }
        }, function (error, response) {
            if (!error) {
                console.log('Put document ');
            } else {
                console.error('Problem in putting doc')
            }
            callback(error, response);
        });
    };
    var getDocs = function() {
    client.search({
        index: 'myindex',
        body: {
        query: {
          match: {
            title: 'test'
          }
        },
        facets: {
          tags: {
            terms: {
              field: 'tags'
            }
          }
        }
        }
    }, function (error, response) {
    });
    }
    return {
        init: init,
        putDoc: putDoc
    }
}

module.exports = elastic()

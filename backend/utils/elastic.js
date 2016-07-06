var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'info'
});
var elastic = function () {
    var init = function (callback) {
        client.indices.exists({index:'index'}, function (err, data) {
            if (data) {
                callback();
                return
            } else {
            
            }
        });
    }
    return {
        init: init
    }
}

module.exports = elastic()

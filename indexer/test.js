var WritableBulk = require('elasticsearch-streams').WritableBulk;
var TransformToBulk = require('elasticsearch-streams').TransformToBulk;
var client = new require('elasticsearch').Client();
 
var bulkExec = function(bulkCmds, callback) {
   console.log(bulkCmds)
  client.bulk({
    index : 'myindex',
    type  : 'mytype',
    body  : bulkCmds
  }, callback);
};
var ws = new WritableBulk(bulkExec);
var toBulk = new TransformToBulk(function getIndexTypeId(doc) { return {_id: doc._id, index:"trolls", type:"post"} });
// stream 42 random records into ES
require('random-document-stream')(5).pipe(toBulk).pipe(ws).on('finish', function () {console.log("done")});

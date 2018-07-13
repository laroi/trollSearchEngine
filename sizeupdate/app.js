var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://192.168.2.43:27017/trolls';
var fs = require('fs');
var gm = require('gm');
var imgLoc = '/home/akbar/dev/trollSearchEngine/backend/assets/uploads/';
MongoClient.connect(url, function(err, db) {
    console.log("Connected successfully to server");
     var collection = db.collection('posts');
        //var stream = collection.find().batchSize(2).stream();
        var stream = collection.find().batchSize(10).stream()
        stream.on('data', function (data) {
            var fileName = data.image.url.split('/')[2];
            gm(imgLoc+fileName)
            .size(function (err, size) {
                if (!err) {
                    console.log('width = ' + size.width);
                    console.log('height = ' + size.height);
                    let imgObj = data.image;
                    imgObj.size = size
                    collection.update({_id: data._id}, {$set:{image: imgObj}}, function (er, da) {
                        if (!er) {
                            console.log('converted file ', fileName);
                        } else {
                            console.error('error in updating db', er)
                        }                    
                    })
                    } else {
                        console.log('error in getting size', err );
                    }
            });
        })
})

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/trolls';
var imgLoc = '/home/akbar/dev/trollSearchEngine/backend/assets/uploads/';
var fs = require('fs');
var gm = require('gm');

MongoClient.connect(url, function(err, db) {
    console.log("Connected successfully to server");
     var collection = db.collection('posts');
        //var stream = collection.find().batchSize(2).stream();
        var stream = collection.find().batchSize(10).stream()
        stream.on('data', function (data) {
            var fileName = data.image.url.split('/')[2];
            var imgPath = imgLoc + fileName
            gm(imgPath)
              .resize('100')
              .gravity('Center')
              .write(imgLoc+'thumb/'+fileName, function (err) {
                if (!err) {
                    var imgObj = data.image;
                        imgObj.thumb = 'images/thumb/'+fileName;
                    collection.update({_id: data._id}, {$set:{image: imgObj}}, function (er, da) {
                        if (!er) {
                            console.log('converted file ', fileName);
                        } else {
                            console.error('error in updating db', er)
                        }
                    
                    })
                    
                } else {
                    console.error('could not resize', err)
                }
              });
        })
})

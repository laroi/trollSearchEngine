const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB = process.env.DB || 'trolls'
const RES_LOC = '../backend/assets';
const FILE_LOC = path.join(__dirname, 'upload');
const FILE_NAME = 'db.json'
const mongodbUrl = `mongodb://${DB_HOST}:${DB_PORT}/${DB}`;
const Transform = require('stream').Transform;
const tar = require('tar');
const xtra = require('fs-extra')
const ncp = require('ncp').ncp;
ncp.limit = 16;
const formatter = new Transform({
    writableObjectMode: true,
    transform(row, encoding, callback) {
        let _row = JSON.stringify(row).toString()
        console.log(_row)
        return callback(null, _row);
    }
});
const createFolder = (loc) => {
    if (!fs.existsSync(loc)){
            fs.mkdirSync(loc);
    } else {
        xtra.removeSync(loc);
        fs.mkdirSync(loc);
    }
}
const tarFolder = (loc) => {
console.log(__dirname);
	return tar.c(
	  {
		gzip: true,
		file: 'my-tarball.tgz',
		cwd:  __dirname
	  },
	  ['upload']
	)
}
createFolder(FILE_LOC)
const file = fs.createWriteStream(path.join(FILE_LOC, FILE_NAME));
MongoClient.connect(mongodbUrl)
    .then((client)=> {
        var db = client.db(DB);
        let postCollection = db.collection('posts');
        let stream = postCollection.find().stream();
        stream.on('end', function() {
            console.log('finished writing db file');
            client.close();
            ncp(RES_LOC, FILE_LOC, function (err) {
                 if (err) {
                    return console.error(err);
                 }
                 console.log('Copied Resource Dir');
				 tarFolder(FILE_LOC)
					.then(()=> {
						console.log('Completed tarring');
					})
					.catch((err) => {
						console.error('Error in tarring');
					})
            });
        });
        stream.pipe(formatter).pipe(file);
        stream.on('error', (err) => {
            console.error(err);
        });

    })
    .catch((err) => {
        console.error('Couldn\'t connect to database ', err);
    })


const fs = require('fs');
const through2 = require('through2')
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB = process.env.DB || 'trolls'
const RES_LOC = '../backend/assets';
const JSONStream = require('JSONStream');
const FOLDER_LOC = path.join(__dirname, 'upload');
const TAR_NAME = 'my-tarball.tgz';
const FILE_NAME = 'db.json'
const mongodbUrl = `mongodb://${DB_HOST}:${DB_PORT}/${DB}`;
const Transform = require('stream').Transform;
const tar = require('tar');
const xtra = require('fs-extra')
const ncp = require('ncp').ncp;
var es = require('event-stream')
const {parser} = require('stream-json');
ncp.limit = 16;

const deleteOld = (loc) => {
    if (!fs.existsSync(loc)){
            xtra.removeSync(loc);
    }
}
const extract =  (fileName) => {
    return tar.x({ file: fileName })
}
const readFile = (loc) => {
    return new Promise((resolve, reject)=> {
        fs.readFile(loc, 'utf-8', (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err);
            }
        })
    })
}

MongoClient.connect(mongodbUrl)
    .then((client)=> {
        deleteOld(FOLDER_LOC);
        var db = client.db(DB);
        let postCollection = db.collection('posts');
        extract(TAR_NAME)
            .then(()=> {
                return readFile(FOLDER_LOC + '/' + FILE_NAME)   
            })
            .then((data)=> {
            console.log(data);
                return postCollection.insertMany([data])
            })
            .then((data)=> {
                console.log(data)
            })
            .catch ((err) => {
                console.error(err);
            })
        })




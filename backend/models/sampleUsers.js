var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var sampleUsers = new Schema({    
    name: String,
    picture : {full: {type: String}, thumb: {type: String}},
    gender : String,
    isUsed: Boolean,
}, { collection: 'sampleUsers' });

module.exports = mongoose.model('sampleUsers', sampleUsers);


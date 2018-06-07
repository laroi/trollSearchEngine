var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var langs = new Schema({    
    _id: {type: 'String', default:'langs'},
    langs:[String]
});
module.exports = mongoose.model('langs', langs);

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var contexts = new Schema({    
    _id: {type: 'String', default:'contexts'},
    contexts:[String]
});
module.exports = mongoose.model('contexts', contexts);

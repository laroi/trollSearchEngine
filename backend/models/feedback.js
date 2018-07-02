var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
    mongoose.Promise = Promise;


var feedback = new Schema({    
    email: {type: String, required: true},
    name: {type: String, required: true},
    message:{type: String, required: true},
    phone : String,
    createdAt: {type: Date, default: Date.now}
});
module.exports = mongoose.model('feedback', feedback);

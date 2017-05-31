var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var group = new Schema({    
    name: {type: String},
    isAdult: {type: Boolean, required: true},
    admins:[String],
    dates: {createdAt: {type: Date}, lastUpdated:{type: Date, default: Date.now}}
});
module.exports = mongoose.model('group', group);

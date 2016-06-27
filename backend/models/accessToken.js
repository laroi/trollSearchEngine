var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var AccessTokenSchema = new Schema({
    token: {type: String, required: true},
    ttl: {type: String, required: true},
    createdAt:{type: Date, required: true, default: Date.now}
});
module.exports = mongoose.model('user', AccessTokenSchema);

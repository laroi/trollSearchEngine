var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var AccessTokenSchema = new Schema({
    token: {type: String, required: true},
    ttl: {type: String, required: true},
    user: {type: String, required: true},
    email: {type: String},
    type: {type: String, required: true},
    createdAt:{type: Date, required: true, default: Date.now}
});
module.exports = mongoose.model('AccessToken', AccessTokenSchema);

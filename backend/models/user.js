var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var AccessTokenSchema = new Schema({
    token: {type: String, required: true},
    ttl: {type: String, required: true}
});
var user = new Schema({
    email: {type: String, required: true},
    verification: {type: String},
    username: {type: String},
    password: {type: String},
    date: {type: Date, default: Date.now},
    access: { type: ObjectId, ref: 'AccessTokenSchema' }
    profile_img: String,
});

module.exports = mongoose.model('user', user);


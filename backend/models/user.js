var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var AccessTokenSchema = new Schema({
    token: {type: String, required: true},
    ttl: {type: String, required: true}
});
var user = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    date: {type: Date, default: Date.now},
    access: { type: ObjectId, ref: 'AccessTokenSchema' }
    profile_img: String,
});

module.exports = mongoose.model('user', user);


var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var comment = new Schema({
    userId: {type: String, required: true},
    comment: {type: String, required: true},
    date: {type: Date, default: Date.now},
});
var post = new Schema({
    userId: {type: String, required: true},
    title: {type: String, required: true},
    type: {type: String, required: true},
    description: {type: String},
    imageUrl: {type: String, required: true},
    tags:[String],
    movie: {type: String},
    actor:[String],
    charactor:[String],
    event: {type: String}
    date: {type: Date, default: Date.now},
    profile_img: String,
});

module.exports = mongoose.model('post', post);

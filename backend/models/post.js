var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var comment = new Schema({
    userId: {type: String, required: true},
    comment: {type: String, required: true},
    date: {type: Date, default: Date.now}
});
var post = new Schema({
    userId: {type: String, required: true},
    title: {type: String},
    type: {type: String, required: true},
    likes: {type: Number,},
    views: {type: Number},
    downloads: {type: Number},
    description: {type: String},
    imageUrl: {type: String, required: true},
    tags:[String],
    movie: {type: String},
    actors:[String],
    characters:[String],
    event: {type: String},
    comments:[comment],
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('post', post);

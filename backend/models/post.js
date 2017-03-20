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
    isAdult: {type: Boolean, required: true},
    likes: [],
    views: {type: Number},
    downloads: {type: Number},
    description: {type: String},
    image: {
        url : {type: String, required: true},
        type: {type: String, required: true} 
    },
    tags:[String],
    movie: {type: String},
    language: {type: String},
    actors:[String],
    characters:[String],
    event: {type: String},
    comments:[comment],
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('post', post);

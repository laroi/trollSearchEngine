var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var post = new Schema({
    user: {id: {type: String, required: true}, name: {type: String, required: false}, image: {type: String, required: false}},
    title: {type: String},
    type: {type: String, required: true},
    isAdult: {type: Boolean, required: true},
    likes: [],
    views: {type: Number},
    downloads: {type: Number},
    description: {type: String},
    isApproved: {type: Boolean, default: false},
    image: {
        url : {type: String, required: true},
        type: {type: String, required: true} 
    },
    context:{type: String},
    tags:[String],
    group:{type: String},
    movie: {type: String},
    language: {type: String},
    actors:[String],
    characters:[String],
    event: {type: Object},
    comments:[String],
    dates: {createdAt: {type: Date}, lastUpdated:{type: Date, default: Date.now}}
});

module.exports = mongoose.model('post', post);

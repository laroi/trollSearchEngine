var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var post = new Schema({
    user: {type: String},
    title: {type: String},
    requestId:{type: String},
    likes: [],
    views: [],
    downloads: [],
    trolls:[],
    shares: [],
    description: {type: String},
    isApproved: {type: Boolean, default: false},
    image: {
        url : {type: String, required: true},
        thumb : {type: String, required: true},
        type: {type: String, required: true},
        size: {width: {type:Number}, height:{type:Number}}
    },
    context:{type: String},
    tags:[String],
    movie: {type: String},
    language: {type: String},
    actors:[String],
    characters:[String],
    comments:[String],
    dates: {createdAt: {type: Date}, lastUpdated:{type: Date, default: Date.now}}
});

module.exports = mongoose.model('post', post);

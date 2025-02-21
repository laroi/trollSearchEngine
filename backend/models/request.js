var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var request = new Schema({
    user: {type: String},
    movie: {type: String},
    title: {type: String},
    language: {type: String},
    description: {type: String},
    link: {type: String},
    isApproved:{type: Boolean, default: false},
    status:{type: String, default : 'P'}, //P -> Pending, 'I' -> Inactive, R -> Resolved
    postId:{type: String},
    image: {
        url : {type: String },
        thumb : {type: String },
        type: {type: String},
        size: {width: {type:Number}, height:{type:Number}}
    },
    comments:[{comment: {type: String}, date: {type: Date}, by: {type: String} }],
    dates: {createdAt: {type: Date}, lastUpdated:{type: Date, default: Date.now}}
});

module.exports = mongoose.model('request', request);

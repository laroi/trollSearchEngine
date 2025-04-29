var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var identify = new Schema({
    description: {type: String},
    isResolved: {type: Boolean, default: false},
    image: {
        url : {type: String, required: true},
        thumb : {type: String},
        type: {type: String},
        size: {width: {type:Number}, height:{type:Number}}
    },    
    movie: {type: String},
    comments:[{comment: {type: String}, date: {type: Date} }],
    randomKey: { type: Number, default: Math.random },
    dates: {createdAt: {type: Date}, lastUpdated:{type: Date, default: Date.now()}}
});

module.exports = mongoose.model('identify', identify);

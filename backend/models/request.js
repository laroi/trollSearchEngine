var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var request = new Schema({
    user: {id: {type: String, required: true}, name: {type: String, required: false}, image: {type: String, required: false}},
    movieName: {type: String},
    language: {type: String},
    description: {type: String},
    link: {type: String},
    status:{type: String, default : 'P'}, //P -> Pending, 'I' -> Inactive
    image: {
        url : {type: String },
        thumb : {type: String },
        type: {type: String}
    },
    dates: {createdAt: {type: Date}, lastUpdated:{type: Date, default: Date.now}}
});

module.exports = mongoose.model('request', request);

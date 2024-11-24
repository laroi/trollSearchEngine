var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var insight = new Schema({
    _id: String,
    movieList: [],
    actorList: [],
});

module.exports = mongoose.model('insight', insight);

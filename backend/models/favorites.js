var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var favorites = new Schema({
    userId: {type: String, required: true, unique: true},
    posts: [String]
});

module.exports = mongoose.model('favorites', favorites);


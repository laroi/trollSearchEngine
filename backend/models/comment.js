var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var comment = new Schema({
    userId: {type: String, required: true},
    postId: {type: String, required: true},
    comment: {type: String, required: true},
    date: {type: Date, default: Date.now}
});

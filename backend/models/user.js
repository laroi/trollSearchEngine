var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var user = new Schema({
    email: {type: String, required: true, unique: true},
    verification: {type: String},
    status: {type: String, default: "inactive"},
    password: {type: String},
    date: {type: Date, default: Date.now},
    type: {type: String, default: 'user'},
    fbId: String,
    name: String,
    picture : {full: {type: String}, thumb: {type: String}},
    phone : String,
    gender : String,
    age : Number,
    stars: [String]
});

module.exports = mongoose.model('user', user);


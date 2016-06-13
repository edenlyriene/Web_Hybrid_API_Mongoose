'use strict';

/********************************
 Dependencies
 ********************************/
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/********************************
 Create User Account Schema
 ********************************/
var commentSchema = new Schema({
    comment:  {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    time: {type : Date, default: Date.now}
});

var postSchema = new Schema({
    //primary
    username: {type: String, required: true},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    text: {type: String, required: true},
    time: {type : Date, default: Date.now},
    comment: [commentSchema],
    like: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Post', postSchema);
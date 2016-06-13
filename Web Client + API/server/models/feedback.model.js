'use strict';

/********************************
 Dependencies
 ********************************/
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/********************************
 Create User Account Schema
 ********************************/

var feedbackSchema = new Schema({
    //primary
    name: {type: String, required: true},
    comment: {type: String, required: true},
    email: {type: String, required: false},
    time: {type : Date, default: Date.now}
});

module.exports = mongoose.model('Feedback', feedbackSchema);
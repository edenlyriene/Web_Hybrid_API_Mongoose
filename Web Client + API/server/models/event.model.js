'use strict';

/********************************
 Dependencies
 ********************************/
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/********************************
 Create User Account Schema
 ********************************/

var eventSchema = new Schema({
    //primary
    title: {type: String, required: true},
    description: {type: String, required: true},
    location: {type: String, required: true},
    time: {type : Date, default: Date.now}, 
    postedBy: {type: String, required: true}
});

module.exports = mongoose.model('Event', eventSchema);
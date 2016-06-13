'use strict';

/********************************
 Dependencies
 ********************************/
var mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

/********************************
 Create User Account Schema
 ********************************/

var accountSchema = new Schema({
    //primary
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    lastname: {type: String, required: true},
    gender: {type: String, required: true},
    //optional
    contact: {type: Number, required: false},
    status: {type: String, required: false},
    facebook: {type: String, required: false},
    twitter: {type: String, required: false},
    friend: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tokens: Array,
    time: {type : Date, default: Date.now}
});

// Used by Passport middleware to validate password against what is stored in DB
accountSchema.methods.validatePassword = function(password, hash) {
    return bcrypt.compareSync(password, hash); // boolean return
};

module.exports = mongoose.model('User', accountSchema);
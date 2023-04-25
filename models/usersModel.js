const { strict } = require('assert');
const { Schema, model } = require('mongoose');


const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    imagen: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        require: true
    },
    friends: {
        type: Array,
        default: []
    },
    profile: {
        type: Array,
        default: []
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }, 
    theme: {
        type: String,
        default: 'default'
    }

});


module.exports = model('User', UserSchema)
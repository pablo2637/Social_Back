const { strict } = require('assert');
const { Schema, model } = require('mongoose');

const UserSchema = new Schema({

    uid: {
        type: String,
        required: true
    },

    name: {
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

    image: {
        type: String,
        required: true
    },

    friends: {
        type: Array,
        default: []
    },

    profile: {
        type: Array,
        default: []
    },

    profileOrder: {
        type: Array,
    },

    privateProfile: {
        type: Array,
        default: []
    },

    privateProfileOrder: {
        type: Array,
    },

    isAdmin: {
        type: Boolean,
        default: false
    },

    date: {
        type: Date,
        default: Date.now
    },

    dateMod: {
        type: Date,
        default: Date.now
    },

    theme: {
        type: String,
        default: 'default'
    }

});


module.exports = model('User', UserSchema)
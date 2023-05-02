const { strict } = require('assert');
const { Schema, model } = require('mongoose');


const ChatSchema = new Schema({
    
    user1: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    user2: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    chat: {
        type: Array,
    },

    date: {
        type: Date,
        default: Date.now
    }

});


module.exports = model('Chat', ChatSchema)
const { strict } = require('assert');
const { Schema, model } = require('mongoose');


const InviteSchema = new Schema({

    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    response: {
        type: Boolean,
        default: false
    },

    accept: {
        type: Boolean
    },

    date: {
        type: Date,
        default: Date.now
    }

});


module.exports = model('Invite', InviteSchema)
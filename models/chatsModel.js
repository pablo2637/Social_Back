const { strict } = require('assert');
const { Schema, model } = require('mongoose');

/** 
 * @author Pablo
 * @exports ChatSchema 
 * @module chatModels
 */


/**
 * Definición del tipo ChatSchema
 * @typedef {Object} ChatSchema
 * @property {Schema.Types.ObjectId} sender ID del usuario que inició el chat
 * @property {Schema.Types.ObjectId} receiver ID del otro usuario que del chat
 * @property {Schema.Types.ObjectId} userDeleted Si el administrador ha eliminado algún participante
 * de este chat, es el ID del usuario eliminado
 * @property {String} chatName Nombre del chat
 * @property {Array} chat Mensajes enviados por los 2 usuarios
 * @property {Number} readSender Indíce del último mensaje leído por el usuario que inició el chat
 * @property {Number} readReceiver Indíce del último mensaje leído por el otro usuario del chat
 * @property {Date} date Fecha en que se creó el chat
 */

/**
 * Schema del documento de la colección Chat, de tipo ChatSchema
 */
const ChatSchema = new Schema({

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

    userDeleted: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    name: {
        type: String,
        required: true,
        unique: true
    },

    chat: {
        type: Array,
    },

    readSender: {
        type: Number
    },

    readReceiver: {
        type: Number
    },

    date: {
        type: Date,
        default: Date.now
    }

});


module.exports = model('Chat', ChatSchema)
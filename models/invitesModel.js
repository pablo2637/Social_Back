const { strict } = require('assert');
const { Schema, model } = require('mongoose');

/** 
 * @author Pablo
 * @exports InviteSchema 
 * @module invitesModel
 */


/**
 * Definición del tipo InviteSchema
 * @typedef {Object} InviteSchema
 * @property {Schema.Types.ObjectId} sender ID del usuario que envió la invitación
 * @property {Schema.Types.ObjectId} receiver ID de usuario que recibió la invitación
 * @property {Boolean} response Si el usuario receptor ha respondido a la invitación
 * @property {Boolean} accept Respuesta del usuario que recibió la invitación
 * @property {Date} date Fecha en que se creó el chat
 */


/**
 * Schema del documento de la colección Invite, de tipo InviteSchema
 */
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
const { strict } = require('assert');
const { Schema, model } = require('mongoose');


/** 
 * @author Pablo
 * @exports UserSchema 
 * @module usersModel
 */


/**
 * Definición del tipo UserSchema
 * @typedef {Object} UserSchema
 * @property {String} uid UID del usuario generada por Firebase
 * @property {String} name NombreID de usuario
 * @property {String} email Email del usuario
 * @property {String} password Password del usuario
 * @property {String} image URL de la imagen
 * @property {Array} [friends] Lista de IDs de los amigos del usuario
 * @property {Array} [msgs] Elementos que componen un mensaje: msg, from, date, read
 * @property {Array} [profile] Elementos que componen el perfil público
 * @property {Array} [profileOrder] Lista de IDs que especifican el orden de los elementos del perfil público
 * @property {Array} [privateProfile] Elementos que componen el perfil privado
 * @property {Array} [privateProfileOrder] Lista de IDs que especifican el orden de los elementos del perfil privado
 * @property {Boolean} [isAdmin] Si es administrador
 * @property {Date} [date] Fecha en que se creó el usuario
 * @property {Date} [dateMod] Fecha en que se mofidicó el perfil público del usuario
 * @property {Date} [privateDateMod] Fecha en que se mofidicó el perfil privado del usuario
 * @property {String} [theme] Tema de apariencia de la app
 */


/**
 * Schema del documento de la colección User, de tipo UserSchema
 */
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

    msgs: {
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

    privateDateMod: {
        type: Date,
        default: Date.now
    },

    theme: {
        type: String,
        default: 'default'
    }

});


module.exports = model('User', UserSchema)
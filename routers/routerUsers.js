const express = require('express');


/** 
 * @author Pablo
 * @exports router 
 * @module routers/Users
 */


/**
 * Definición del tipo User
 * @typedef {Object} User
 * @property {String} _id ID del usuario
 * @property {String} uid UID del usuario generado por Firebase
 * @property {String} name Nombre del usuario
 * @property {String} email Email del usuario
 * @property {String} image URL de la imagen del usuario * 
 * @property {Array} friends Lista de los ids de los amigos del usuario * 
 * @property {Date} dateMod Fecha de modificación del perfil
 * @property {Array} profile Elementos de tipo ProfileElement, que componen el perfil
 * @property {Array} profileOrderIDs de los elementos que conforman el perfil en un orden específico
 * @property {Array} privateProfile Elementos de tipo ProfileElement, que componen el perfil privado
 * @property {Array} privateProfileOrder IDs de los elementos que conforman el perfil en un orden específico privado
 * @property {Boolean} isAdmin Valor que designa si un usuario es administrador
 */


/**
 * Definición del tipo Profile
 * @typedef {Object} Profile
 * @property {String} _id ID del usuario
 * @property {String} uid ID generado por Firebase del usuario
 * @property {String} name Nombre del usuario
 * @property {String} email Email del usuario
 * @property {String} image URL de la imagen del usuario
 * @property {Array} profile Elementos de tipo ProfileElement, que componen el perfil
 * @property {Array} profileOrder IDs de los elementos que conforman el perfil en un orden específico
 */


/**
 * Definición del tipo ProfileElement
 * @typedef {Object} ProfileElement
 * @property {String} content El contenido del elemento (ej: url de la imagen o el value de un input)
 * @property {String} typeInput Tipo de elemento (title, text, image, paragraph)
 * @property {String} id ID del elemento
 * @property {String} name Nombre del elemento
 */


/**
 * Ruta de express: [server]/api/users/...
 * @type {object}
 * @const
 * @namespace routerUsers
 */
const router = express.Router();

const { check } = require('express-validator');
const { validateInputs } = require('../middlewares/validateInputs');

const { upload, uploadMulti } = require('../middlewares/uploadImg')

const {
    createInvite, respondInvite, getInvites, deleteInvite,

    createUser, updateUser, deleteUser,

    getUsers, getUserByEmail,

    getChats,

    loginUser,

    updateUsersFriends,

    updateUsersProfile

} = require('../controllers/usersController');


/**
* Ruta para devolver todos los chats de un usuarios
* @name (get)/chats/:
* @function
* @memberof module:routers/Users~routerUsers
* @param {String} _id El ID del usuario
* @inner
*/
router.get('/chats/:_id', getChats);


/**
* Ruta para devolver todos los chats de un usuarios
* @name (get)/Users
* @function
* @memberof module:routers/Users~routerUsers
* @inner
*/
router.get('/', getUsers);


/**
* Ruta para devolver todos los datos del usuario
* @name (get)/email/:
* @function
* @memberof module:routers/Users~routerUsers
* @param {String} email El email del usuario
* @inner
*/
router.get('/email/:email', getUserByEmail);


/**
* Ruta para actualizar el perfil del usuario
* @name (put)/profile
* @function
* @memberof module:routers/Users~routerUsers
* @param {Profile} profile [body] El perfil del usuario
* @inner
*/
router.put('/profile', [
    uploadMulti
], updateUsersProfile);


/**
* Ruta para eliminar un amigo de la lista de amigos de un usuario
* @name (put)/friends
* @function
* @memberof module:routers/Users~routerUsers
* @param {String} _id [body] El ID del usuario
* @param {String} friendID [body] El ID del usuario a eliminar
* @inner
*/
router.put('/friends', updateUsersFriends);


/**
* Ruta para crear una invitación
* @name (post)/invite
* @function
* @memberof module:routers/Users~routerUsers
* @param {String} sender [body] El ID del usuario que envía la invitación
* @param {String} receiver [body] El ID del usuario que va a recibir la invitación
* @inner
*/
router.post('/invite', createInvite);


/**
* Ruta para responder a una invitación
* @name (put)/invite
* @function
* @memberof module:routers/Users~routerUsers
* @param {String} sender [body] El ID del usuario que envía la invitación
* @param {String} receiver [body] El ID del usuario que va a recibir la invitación
* @inner
*/
router.put('/invite', respondInvite);


/**
* Ruta para eliminar una invitación
* @name (delete)/invite
* @function
* @memberof module:routers/Users~routerUsers
* @param {String} _id [body] El ID de la invitación a eliminar
* @inner
*/
router.delete('/invite', deleteInvite);


/**
* Ruta que devuelve todas las invitaciones activas
* @name (get)/invite
* @function
* @memberof module:routers/Users~routerUsers
* @inner
*/
router.get('/invite', getInvites);


/**
* Ruta para crear un usuario nuevo
* @name (post)/
* @function
* @memberof module:routers/Users~routerUsers
* @param {User} user [body] El objeto con los datos para crear el usuario
* @inner
*/
router.post('/', [
    // check('name', 'El nombre es obligatorio.').trim().notEmpty(),    
    // check('email', 'El email es obligatorio, por favor, verifícalo.').trim().isEmail(),
    // check('image', 'La imagen es obligatoria.').trim().notEmpty(),
    // validateInputs,    
    upload
], createUser);


/**
* Ruta para editar un usuario
* @name (put)/
* @function
* @memberof module:routers/Users~routerUsers
* @param {User} user [body] El objeto con los datos para modificar el usuario
* @inner
*/
router.put('/', [
    // check('name', 'El nombre es obligatorio.').trim().notEmpty(),
    // check('image', 'La imagen es obligatoria.').trim().notEmpty(),
    // validateInputs
    upload
], updateUser);


/**
* Ruta para eliminar un usuario
* @name (delete)/
* @function
* @memberof module:routers/Users~routerUsers
* @param {String} _id [body] El ID del usuario a eliminar
* @inner
*/
router.delete('/', deleteUser);


router.post('/login', [
    check('email', 'El email es obligatorio, por favor, verifícalo.').trim().isEmail(),
    validateInputs
], loginUser);


module.exports = router
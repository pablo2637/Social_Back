const User = require('../models/usersModel');
const Invite = require('../models/invitesModel');
const Chat = require('../models/chatsModel');

const { FirebaseApp } = require('../configs/firebase');
const bcrypt = require('bcryptjs');
const { uploadCloud } = require('../helpers/uploadCloud');
const fs = require('fs').promises;
const { execute } = require('./socketController');

const msgPass = 'Oculto por seguridad...';


/** 
 * @author Pablo
 * @exports Object
 * @module usersController
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
 * Definición del tipo Invite
 * @typedef {Object} Invite 
 * @property {String} _id ID de la invitación
 * @property {String} sender ID del usuario que envió la invitación
 * @property {String} receiver ID del usuario invitado
 * @property {Date} date URL de la imagen del usuario 
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
* Devuelve todos los usuarios.
* @method getUsers
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg y data, que es un array con los usuarios
* @throws {json} Devuelve el error
*/
const getUsers = async (req, res) => {

    try {

        const users = await User.find();

        if (users.length == 0)
            return res.status(200).json({
                ok: true,
                msg: 'No hay usuarios en la bbdd.',
                data: []
            });

        users.map(user => user.password = msgPass);

        return res.status(200).json({
            ok: true,
            msg: 'Usuarios encontrados con éxito',
            data: users
        });

    } catch (e) {
        console.log('getUsers error:', e);

        return res.status(404).json({
            ok: false,
            msg: 'Error getUsers: fallo al intentar recuperar todos los usuarios',
            error: e
        });

    };
};


/**
* Devuelve un usuarios buscándolo por el email.
* @method getUserByEmail
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, necesita en el
params, email: con el correo del usuario
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg y user, que es un json de tipo User
* @throws {json} Devuelve el error
*/
const getUserByEmail = async ({ params }, res) => {

    try {

        const user = await User.findOne({ "email": params.email });

        if (!user)
            return res.status(403).json({
                ok: false,
                msg: `El email ${params.email} no esta registrado en la bbdd.`,
            });


        user.password = msgPass;
        return res.status(200).json({
            ok: true,
            msg: 'Usuario encontrado con éxito',
            user
        });

    } catch (e) {
        console.log('getUserByEmail error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'getUserByEmail: fallo al intentar buscar el usuario.',
            error: e
        });

    };
};



/**
* Crea un usuario.
* @method createUser
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, necesita en el
body: uid, name, email, password e image.
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg y user, que es un json de tipo User
* @throws {json} Devuelve el error
*/
const createUser = async (req, res) => {

    try {

        const body = new Object(req.body);

        const yaExiste = await User.findOne({ "email": body.email });

        if (yaExiste)
            return res.status(403).json({
                ok: false,
                msg: `createUser: no es posible crear el usuario. El email ${body.email} ya esta en uso.`,
            });


        let urlPic;
        if (req.file)
            urlPic = await uploadCloud(`./public/${req.file.filename}`, body.uid, 'Social');

        else
            urlPic = await uploadCloud(body.image, body.uid, 'Social');


        body.image = urlPic;
        const user = new User(body);
        const salt = bcrypt.genSaltSync(10);

        user.password = bcrypt.hashSync(body.password, salt);


        await user.save();

        if (req.file)
            await fs.unlink(`./public/${req.file.filename}`);


        execute({
            to: 'all',
            command: ['profiles']
        });

        user.password = msgPass;
        return res.status(201).json({
            ok: true,
            msg: 'Usuario creado con éxito',
            user
        });

    } catch (e) {
        console.log('createUser error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'createUser: Ha habido un fallo al crear el usuario.',
            error: e
        });

    };
};



/**
* Modifica un usuario.
* @method updateUser
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, necesita en el
body: _id, uid, name e image.
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg y user, que es un json de tipo User
* @throws {json} Devuelve el error
*/
const updateUser = async (req, res) => {

    try {

        const body = new Object(req.body);

        let { _id, uid, name, image, imageURL } = body;

        let urlPic;
        if (req.file)
            urlPic = await uploadCloud(`./public/${req.file.filename}`, uid, 'Social');

        else
            urlPic = await uploadCloud(imageURL, body.uid, 'Social');


        image = urlPic;
        const user = await User.findByIdAndUpdate(_id,
            { name, image }, { new: true });

        if (!user)
            return res.status(400).json({
                ok: false,
                msg: `No existe ningún usuario con el ObjectId(${id})`
            });


        if (req.file)
            await fs.unlink(`./public/${req.file.filename}`);

        execute({
            to: '-1',
            command: ['profiles'],
            id: _id
        });

        user.password = msgPass;
        return res.status(200).json({
            ok: true,
            msg: 'Usuario actualizado con éxito',
            user
        });


    } catch (e) {
        console.log('updateUser error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'updateUser: Ha habido un fallo al modificar el usuario.',
            error: e
        });

    };
};



/**
* Elimina un usuario de la base de datos de Firebase, de la de MongoDB borra: el usuario,
* las invitaciones y actualiza sus chats para marcar que ese usuario ha sido eliminado y por
* último quita este usuario de las listas de amigos que lo contengan.
* @method deleteUser
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, necesita en el
body: _id con el ID del usuario y uid: con el UID del usuario de Firebase
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg y user, que es un json de tipo User
* @throws {json} Devuelve el error
*/
const deleteUser = async ({ body }, res) => {

    try {

        const { _id, uid } = body;

        await FirebaseApp.auth().deleteUser(uid);

        const user = await User.findByIdAndDelete(_id);

        if (!user)
            return res.status(400).json({
                ok: false,
                msg: `No existe ningún usuario con el ObjectId(${body._id})`
            });


        await Invite.deleteMany({
            $or: [
                { "sender": _id },
                { "receiver": _id }
            ]
        });

        await Chat.updateMany({
            $or: [
                { "sender": _id },
                { "receiver": _id }
            ]
        }, { $set: { userDeleted: _id } });

        await User.updateMany({ "friends": _id }, { $pull: { "friends": _id } });


        execute({
            to: '-1',
            command: ['invites', 'profiles', 'chats', 'friends'],
            id: _id
        });

        execute({
            to: '1',
            command: ['logout'],
            id: _id
        });

        return res.status(201).json({
            ok: true,
            msg: 'Usuario eliminado con éxito'
        });

    } catch (e) {
        console.log('deleteUser error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'deleteUser: Ha habido un fallo al eliminar el usuario.',
            error: e
        });

    };
};



const loginUser = async ({ body }, res) => {

    try {

        const user = await User.findOne({ "email": body.email });

        if (!user)
            return res.status(403).json({
                ok: false,
                msg: `El email ${body.email} no esta registrado en la bbdd.`,
            });

        const passwordOk = bcrypt.compareSync(body.password, user.password);

        if (!passwordOk)
            return res.status(401).json({
                ok: false,
                msg: 'El usuario/contraseña no corresponden a los datos almacenados.',
            });

        user.password = msgPass;
        return res.status(200).json({
            ok: true,
            msg: 'Login correcto.',
            user
        });

    } catch (e) {
        console.log('loginUser error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'loginUser: fallo al intentar loguear al usuario.',
            error: e
        });

    };
};


module.exports = {
    getUsers,
    getUserByEmail,
    loginUser,
    updateUser,
    deleteUser,
    createUser
}
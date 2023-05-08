const Chat = require('../models/chatsModel');
const User = require('../models/usersModel');

const { execute } = require('./socketController');

const msgPass = 'Oculto por seguridad...';

/** 
 * @author Pablo
 * @exports Object
 * @module othersController
 */


/**
* Devuelve todos los chats del usuario.
* @method getChats
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, en el 
params debe tener '_id' con el id del usuario.
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg y data, que es un array con los chats
* @throws {json} Devuelve el error
*/
const getChats = async ({ params }, res) => {

    try {

        const { _id } = params;

        if (_id == 'undefined')
            return res.status(404).json({
                ok: false,
                msg: 'Error getChats: el valor de "_id" es "undefined"'
            });

        const chats = await Chat.find({
            $or: [
                { "sender": _id },
                { "receiver": _id }
            ]
        });

        if (chats.length == 0)
            return res.status(200).json({
                ok: true,
                msg: 'No hay chats en la bbdd.',
                data: []
            });

        return res.status(200).json({
            ok: true,
            msg: 'Chats recuperadas con éxito',
            data: chats
        });

    } catch (e) {
        console.log('getChats error:', e);

        return res.status(404).json({
            ok: false,
            msg: 'Error getChats: fallo al intentar recuperar todos los chats',
            error: e
        });

    };
};




/**
* Crea un mensaje de un usuario a otro
* @method createMsg
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, en el 
* body debe tener '_id' con el ID del usuario que recibirá el mensaje, msg: el mensaje en sí
* y from: el ID del usuario que envía el mensaje
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg 
* @throws {json} Devuelve el error
*/
const createMsg = async ({ body }, res) => {

    try {

        const { _id, from, msg } = body;

        const update = {
            from,
            date: Date(),
            msg,
            read: false
        }
        console.log('update', update, _id)
        const user = await User.findByIdAndUpdate(_id,
            { $push: { msgs: update } }, { new: true });


        execute({
            to: '1',
            command: ['msgs'],
            id: _id
        });

        return res.status(201).json({
            ok: true,
            msg: 'Mensaje creado con éxito'
        });

    } catch (e) {
        console.log('createMsg error:', e);

        return res.status(404).json({
            ok: false,
            msg: 'Error createMsg: fallo al intentar crear el mensaje',
            error: e
        });

    };
};



/**
* Devuelve todos los mensajes del usuario
* @method getChats
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, en el 
params debe tener '_id' con el id del usuario.
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg y data, que es un array con los mensajes
* @throws {json} Devuelve el error
*/
const getMsgs = async ({ params }, res) => {

    try {

        const { _id } = params;
        if (_id == 'undefined')
            return res.status(404).json({
                ok: false,
                msg: 'Error getMsgs: el valor de "_id" es "undefined"'
            });

        const user = await User.findById(_id);

        if (user.msgs.length == 0)
            return res.status(200).json({
                ok: true,
                msg: 'No hay mensajes en la bbdd.',
                data: []
            });

        return res.status(200).json({
            ok: true,
            msg: 'Mensajes recuperadas con éxito',
            data: user.msgs
        });

    } catch (e) {
        console.log('getMsgs error:', e);

        return res.status(404).json({
            ok: false,
            msg: 'Error getMsgs: fallo al intentar recuperar todos los mensajes',
            error: e
        });

    };
};




/**
* Devuelve todos los amigos del usuario
* @method getFriends
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, en el 
params debe tener '_id' con el id del usuario.
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg y data, que es un array con los amigos
* @throws {json} Devuelve el error
*/
const getFriends = async ({ params }, res) => {

    try {
console.log('params',params)
        const { _id } = params;
        if (_id == 'undefined')
            return res.status(404).json({
                ok: false,
                msg: 'Error getFriends: el valor de "_id" es "undefined"'
            });

        const user = await User.findById(_id);

        if (user.friends.length == 0)
            return res.status(200).json({
                ok: true,
                msg: 'No hay mensajes en la bbdd.',
                data: []
            });

        return res.status(200).json({
            ok: true,
            msg: 'Amigos recuperadas con éxito',
            data: user.friends
        });

    } catch (e) {
        console.log('getFriends error:', e);

        return res.status(404).json({
            ok: false,
            msg: 'Error getFriends: fallo al intentar recuperar todos los amigos',
            error: e
        });

    };
};




/**
* Elimina de la lista de amigos un usuario.
* @method updateUsersFriends
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, necesita en el
body: _id y friendID
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg y user, que es un json de tipo User
* @throws {json} Devuelve el error
*/
const updateUsersFriends = async ({ body }, res) => {

    try {

        const { _id, friendID } = body;

        const user = await User.findByIdAndUpdate(_id, { $pull: { friends: friendID } }, { new: true });

        if (!user)
            return res.status(400).json({
                ok: false,
                msg: `No existe ningún usuario con el ObjectId(${_id})`
            });


        execute({
            to: '1',
            command: ['friends'],
            id: friendID
        });

        user.password = msgPass;
        return res.status(201).json({
            ok: true,
            msg: 'Usuario actualizado con éxito',
            user
        });

    } catch (e) {
        console.log('updateUsersFriends error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'updateUsersFriends: Ha habido un fallo al modificar el usuario.',
            error: e
        });

    };
};



module.exports = {
    getChats,
    getMsgs,
    getFriends,
    updateUsersFriends,
    createMsg
}
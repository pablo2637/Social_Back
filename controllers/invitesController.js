
const Invite = require('../models/invitesModel');
const User = require('../models/usersModel');
const { execute } = require('./socketController');

/** 
 * @author Pablo
 * @exports Object
 * @module invitesController
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
* Elimina una invitaciòn pasando el id.
* @method deleteInvite
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, en el 
body debe tener '_id' con el id del usuario.
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg
* @throws {json} Devuelve el error
*/
const deleteInvite = async ({ body }, res) => {

    try {
        console.log('body', body)
        const { _id, isAdmin } = body;
        const invite = await Invite.findByIdAndDelete(_id);
        console.log('invite', invite)
        if (!invite)
            return res.status(400).json({
                ok: false,
                msg: `No existe ninguna invitación con el ObjectId(${_id})`
            });

        const to = isAdmin == true ? 'list' : '-1';
        console.log('isAdmin', isAdmin)
        execute({
            to,
            command: ['invites'],
            id: invite.sender,
            ids: [invite.sender, invite.receiver]
        });

        return res.status(201).json({
            ok: true,
            msg: 'Invitación eliminada con éxito.'
        });

    } catch (e) {
        console.log('deleteInvite error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'deleteInvite: Ha habido un fallo al eliminar la invitación.',
            error: e
        });

    };
};


/**
* Devuelve todas las invitaciones.
* @method getInvites
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg y data, que es un array con las invitaciones
* @throws {json} Devuelve el error
*/
const getInvites = async (req, res) => {

    try {

        const invites = await Invite.find({ response: false });

        if (invites.length == 0)
            return res.status(200).json({
                ok: true,
                msg: 'No hay invitaciones en la bbdd.',
                data: []
            });

        return res.status(200).json({
            ok: true,
            msg: 'Invitaciones recuperadas con éxito',
            data: invites
        });

    } catch (e) {
        console.log('getInvites error:', e);

        return res.status(404).json({
            ok: false,
            msg: 'Error getInvites: fallo al intentar recuperar todos las invitaciones',
            error: e
        });

    };
};


/**
* Crea una invitación para ser amigos.
* @method createInvite
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, debe contener
en el body: sender y receiver, con los ids de los usuarios.
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg e invite, que es un json con la invitación creada
* @throws {json} Devuelve el error
*/
const createInvite = async ({ body }, res) => {

    try {
        console.log('body', body)
        const { sender, receiver } = body;

        const yaExiste = await Invite.findOne({
            "sender": sender,
            "receiver": receiver,
            "response": false
        });
        console.log('yaExiste', yaExiste)
        if (yaExiste)
            return res.status(200).json({
                ok: true,
                msg: `No es posible enviar la invitación, porque ya hay una pendiente de respuesta`,
            });


        const invite = new Invite({ sender, receiver });

        const ya = await invite.save();
        console.log('ya', ya)

        execute({
            to: '1',
            command: ['invites'],
            id: receiver
        });
        return res.status(201).json({
            ok: true,
            msg: 'Invitación creada con éxito',
            invite
        });

    } catch (e) {
        console.log('incomingInvite error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'incomingInvite: Ha habido un fallo al crear la invitación.',
            error: e
        });

    };
}


/**
* Da respuesta a una invitación.
* @method respondInvite
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, debe contener
en el body: sender, receiver, con los ids de los usuarios, _id: con el id de la invitación
y accept: con la resolución de la invitación.
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg e invite, que es un json con la invitación creada
* @throws {json} Devuelve el error
*/
const respondInvite = async ({ body }, res) => {

    try {
        console.log('respond body', body)
        const response = true;
        const { accept, _id, sender, receiver } = body;

        const invite = await Invite.findByIdAndUpdate(_id,
            { response, accept }, { new: true });

        if (!invite)
            return res.status(400).json({
                ok: false,
                msg: `No existe ninguna invitación con el ObjectId(${_id})`
            });

        if (accept) {
            const friend1 = await User.findByIdAndUpdate(sender,
                { $push: { friends: receiver } }, { new: true });

            const friend2 = await User.findByIdAndUpdate(receiver,
                { $push: { friends: sender } }, { new: true });

            if (!friend1 || !friend2)
                return res.status(400).json({
                    ok: false,
                    msg: `Error al agregar el amigo`
                });
        }

        console.log('toko ok', invite)
        execute({
            to: '1',
            command: ['invites', 'friends'],
            id: sender
        });
        return res.status(200).json({
            ok: true,
            msg: 'Invitación actualizada con éxito',
            invite
        });

    } catch (e) {
        console.log('respondInvite error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'respondInvite: Ha habido un fallo al responder a la invitación.',
            error: e
        });

    };
}


module.exports = {
    respondInvite,
    createInvite,
    deleteInvite,
    getInvites
}
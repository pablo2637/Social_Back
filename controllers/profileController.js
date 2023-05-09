const { uploadCloud } = require('../helpers/uploadCloud');
const fs = require('fs').promises;
const User = require('../models/usersModel');
const { execute } = require('./socketController');


const msgPass = 'Oculto por seguridad...';


/** 
 * @author Pablo
 * @exports Object
 * @module profileController
 */


/**
 * Definición del tipo User
 * @typedef {Object} User
 * @property {String} _id ID del usuario
 * @property {String} uid UID del usuario generado por Firebase
 * @property {String} name Nombre del usuario
 * @property {String} email Email del usuario
 * @property {String} image URL de la imagen del usuario 
 * @property {Array} friends Lista de los ids de los amigos del usuario 
 * @property {Array} msgs Elementos que componen un mensaje: msg, from, to, date, read
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
 * Ordena el array del perfil de usuario
 * @method orderArray
 * @param {Array} arrayOriginal El array del perfil del usuario
 * @param {Array} arrayOrder El array del orden de los elementos del perfil
 * @returns {Array} Devuelve un nuevo array ordenado según el orden de arrayOrder
 */
const orderArray = (arrayOriginal, arrayOrder) => {

    const newArray = [];

    arrayOrder.forEach(el => {
        newArray.push(arrayOriginal.find(elAO => elAO.id == el));
    });

    return newArray;
};


/**
 * Comprueba que se hayan recibido las imagenes del perfil del usuario, y en caso de
 * que no estén, las reemplaza del perfil por las url de las imagenes almacenadas previamente
 * @method checkAttachsFiles
 * @param {Array} attachs son las imagenes que llegan en req.files
 * @param {Array} profile Array con el perfil del usuario
 * @returns {Array} Devuelve 2 arrays, uno con el perfil modificado y otro array con las imagenes que
 * deben subirse a Cloudinary
 */
const checkAttachsFiles = (attachs, profile) => {

    const upload = [];
    for (const [key, value] of Object.entries(profile)) {

        if (key.includes('imageURL')) {

            const tempImg = key.split('_');
            const exists = attachs.find(att => att.fieldname == tempImg[0]);

            if (!exists) {

                profile[tempImg[0]] = value

                const tempName = value.split('/');
                upload.push({
                    url: value,
                    name: tempName[tempName.length - 1]
                })
            }

            delete profile[key];
        }
    };

    for (const key of Object.entries(profile)) {

        if (key.includes('imageURL')) delete profile[key];
    };

    return { profile, upload };
};



/**
* Actualiza el perfil público del usuario
* @method updateUsersProfile
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, necesita en el
body: _id, uid, profileOrder y todos los elementos que componen el perfil del usuario
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg y user, que es un json de tipo User
* @throws {json} Devuelve el error
*/
const updateUsersProfile = async (req, res) => {

    try {

        const body = new Object(req.body);
        const { _id, uid, profileOrder, ...profile } = body;

        let newProfile = [];
        const newProfileOrder = profileOrder.split(',');

        const arrayFiles = req.files || [];

        const { profile: arrayOK, upload } = checkAttachsFiles(arrayFiles, profile);


        for (const key in arrayOK) {
            const tempKey = key.split('-');
            newProfile.push({
                content: profile[key],
                typeInput: tempKey[0],
                id: key,
                name: key
            });
        }


        let urlPic;
        if (arrayFiles) {

            for (let i = 0; i < arrayFiles.length; i++) {
                urlPic = await uploadCloud(`${req.destination}/${arrayFiles[i].filename}`, i + body.uid, `Social/${body.uid}`);
                newProfile.push({
                    content: urlPic,
                    typeInput: 'image',
                    id: arrayFiles[i].fieldname,
                    name: arrayFiles[i].fieldname
                });
            };
        }

        for (let i = 0; i < upload.length; i++) {
            urlPic = await uploadCloud(upload[i].url, upload[i].name, `Social/${body.uid}`);
        };


        newProfile = orderArray(newProfile, newProfileOrder);


        const update = { $set: { profile: newProfile, profileOrder: newProfileOrder, dateMod: Date() } };
        const response = await User.updateOne({ _id }, update, { new: true });

        if (!response)
            return res.status(400).json({
                ok: false,
                msg: `No existe ningún usuario con el ObjectId(${id})`
            });


        const user = await User.findById(_id);

        if (arrayFiles) {
            for (let i = 0; i < arrayFiles.length; i++) {
                await fs.unlink(`${req.destination}/${arrayFiles[i].filename}`);
            }
        }

        execute({
            to: '-1',
            command: ['profiles'],
            id: _id
        });

        user.password = msgPass;
        return res.status(201).json({
            ok: true,
            msg: 'Usuario actualizado con éxito',
            user
        });

    } catch (e) {
        console.log('updateUsersProfile error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'updateUsersProfile: Ha habido un fallo al modificar el usuario.',
            error: e
        });

    };
};




/**
* Actualiza el perfil privado del usuario
* @method updateUsersPrivateProfile
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas, necesita en el
body: _id, uid, profileOrder y todos los elementos que componen el perfil del usuario
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg y user, que es un json de tipo User
* @throws {json} Devuelve el error
*/
const updateUsersPrivateProfile = async (req, res) => {

    try {

        const body = new Object(req.body);
        const { _id, uid, privateProfileOrder, ...privateProfile } = body;

        let newProfile = [];
        const newProfileOrder = privateProfileOrder.split(',');

        const arrayFiles = req.files || [];


        const { profile: arrayOK, upload } = checkAttachsFiles(arrayFiles, privateProfile);

        for (const key in arrayOK) {
            const tempKey = key.split('-');
            newProfile.push({
                content: privateProfile[key],
                typeInput: tempKey[0],
                id: key,
                name: key
            });
        }


        let urlPic;
        if (arrayFiles) {

            for (let i = 0; i < arrayFiles.length; i++) {
                urlPic = await uploadCloud(`${req.destination}/${arrayFiles[i].filename}`, i + body.uid, `Social/${body.uid}`);
                newProfile.push({
                    content: urlPic,
                    typeInput: 'image',
                    id: arrayFiles[i].fieldname,
                    name: arrayFiles[i].fieldname
                });
            };
        }

        for (let i = 0; i < upload.length; i++) {
            urlPic = await uploadCloud(upload[i].url, upload[i].name, `Social/${body.uid}/private`);
        };


        newProfile = orderArray(newProfile, newProfileOrder);


        const update = { $set: { privateProfile: newProfile, privateProfileOrder: newProfileOrder, privateDateMod: Date() } };
        const response = await User.updateOne({ _id }, update, { new: true });

        if (!response)
            return res.status(400).json({
                ok: false,
                msg: `No existe ningún usuario con el ObjectId(${id})`
            });


        const user = await User.findById(_id);

        if (arrayFiles) {
            for (let i = 0; i < arrayFiles.length; i++) {
                await fs.unlink(`${req.destination}/${arrayFiles[i].filename}`);
            }
        }

        execute({
            to: '-1',
            command: ['profiles'],
            id: _id
        });

        user.password = msgPass;
        return res.status(201).json({
            ok: true,
            msg: 'Usuario actualizado con éxito',
            user
        });

    } catch (e) {
        console.log('updateUsersPrivateProfile error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'updateUsersPrivateProfile: Ha habido un fallo al modificar el usuario.',
            error: e
        });

    };
};


module.exports = {
    updateUsersProfile,
    updateUsersPrivateProfile
}
const User = require('../models/usersModel');

/**
 * @author Pablo
 * @exports Object
 * @module publicController
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
* Devuelve todos los perfiles de los usuarios.
* @method getProfiles
* @async
* @param {Object} req Es el requerimiento que proviene de las rutas
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Devuelve OK, msg y data, que es un array de tipo Profile
* @throws {json} Devuelve el error
*/
const getProfiles = async (req, res) => {

    try {

        const profiles = await User.find({ "isAdmin": false }, {
            name: 1,
            image: 1,
            email: 1,
            profile: 1,
            profileOrder: 1,
            privateProfile: 1,
            privateProfileOrder: 1,
            privateDateMod: 1,
            dateMod: 1
        }).sort({ dateMod: -1 });;

        if (profiles.length == 0)
            return res.status(400).json({
                ok: false,
                msg: 'No hay perfiles en la bbdd.'
            });


        return res.status(200).json({
            ok: true,
            msg: 'Perfiles encontrados con éxito',
            data: profiles
        });

    } catch (e) {
        console.log('getProfiles error:', e);

        return res.status(404).json({
            ok: false,
            msg: 'Error getProfiles: fallo al intentar recuperar todos los perfiles',
            error: e
        });

    };
};



module.exports = {
    getProfiles
}
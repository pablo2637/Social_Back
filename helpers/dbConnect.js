const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

/** 
 * @author Pablo
 * @exports Object 
 * @module dbConnect
 */


/**
 * Se conecta a la base de datos de MongoDB
 * @method connect
 * @async
 * @requires URI de conexión
 * @returns {String} La conexión a la base de datos
 * @throws {Error} 
 */
const connect = async () => {
    try {
        const response = await mongoose.connect(process.env.URI_CONNECT);
        console.log('Connected to the database...');
        return response;
    } catch (error) {
        return {
            ok: false,
            msg: 'Connecion failure.',
            error
        }
    }
}

module.exports = { connect }
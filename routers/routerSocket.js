const express = require('express');

/** 
 * @author Pablo
 * @exports router 
 * @module routers/Socket
 */


/**
 * Definición del tipo Order
 * @typedef {Object} Order
 * @property {String} command La orden a ejecutar (reload_profiles / reload_invites / reload_user / 
 * reload_chats / reload_all)
 * @property {String} to A quien debe emitirse la orden (1 / -1 / all)
 * @property {String} [id] El ID del usuario al que enviar la orden o al que NO debe enviarse según
 * se requiera
 */


/**
 * Ruta de express: [server]/api/socket/...
 * @type {object}
 * @const
 * @namespace routerSocket
 */
const router = express.Router();

const {
    executeEP,
    getInternalData
} = require('../controllers/socketController');


/**
* Ruta para ejecutar órdenes en los sockets conectados
* @name (post)/
* @function
* @memberof module:routers/Socket~routerSocket
* @param {Order} order [body] Las instrucciones a enviar
* @inner
*/
router.post('/', executeEP);


router.get('/data', getInternalData);


module.exports = router;

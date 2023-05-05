const express = require('express');

/** 
 * @author Pablo
 * @exports router 
 * @module routers/Public
 */


/**
 * Ruta de express: [server]/api/public/...
 * @type {object}
 * @const
 * @namespace routerPublic
 */
const router = express.Router();

const { getProfiles } = require('../controllers/publicController')


/**
 * Ruta que devuelve todos los perfiles públicos
 * @name (get)/Profiles
 * @function
 * @memberof module:routers/Public~routerPublic
 * @inner
 */
router.get('/', getProfiles);

module.exports = router;
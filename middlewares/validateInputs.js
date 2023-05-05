const { validationResult } = require('express-validator');

/** 
 * @author Pablo
 * @exports Object 
 * @module validateInputs
 */


/**
* Middleware para validar los datos recibidos desde un formulario
* @method validateInputs
* @param {Object} req Es el requerimiento que proviene de las rutas, en el 
body debe tener los datos a validar
* @param {Object} res Es la respuesta que proviene de las rutas 
* @returns {json} Ejecuta la función next() dando paso a la siguiente función
* @throws {json} Con los errores encontrados
*/
const validateInputs = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty())
        return res.status(400).json({
            ok: false,
            errors: errors.mapped()
        });

    next();

};


module.exports = { validateInputs };
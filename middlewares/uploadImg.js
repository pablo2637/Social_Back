const multer = require('multer');

/** 
 * @author Pablo
 * @exports Object 
 * @module uploadImg
 */


/**
 * Almacena en la constante 'storage'  la configuración para generar los archivos
 */
const storage = multer.diskStorage({

    /**  
     * Especifica dónse almacenarán los archivos creados
     * @param {Object} req Es el requerimiento que proviene de las rutas
     * @param {Object} file Son los datos para generar el archivo de imagen 
     * @param {Function} cb Función callback
     */
    destination: function (req, file, cb) {
        cb(null, `${process.cwd()}/public/`);
    },

    /**  
     * Especifica el nombre del archivo que se creará
     * @param {Object} req Es el requerimiento que proviene de las rutas
     * @param {Object} file Son los datos para generar el archivo de imagen 
     * @param {Function} cb Función callback
     */
    filename: function (req, file, cb) {
        console.log('file', file);
        const extension = file.originalname.split('.');
        if (extension.length > 0) {

            const uniqueSuffix = `${Date.now()}.${extension[extension.length - 1]}`;
            cb(null, uniqueSuffix);

        } else
            cb(null, Date.now());
    }
});


/**
 * Middleware que genera un sólo archivo. 
 * Requiere la constante 'storage' con la configuración para generar los archivos
 */
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // límite de tamaño de archivo
    }
}).single('image');


/**
 * Middleware que genera un array de archivos. 
 * Requiere la constante 'storage' con la configuración para generar los archivos
 */
const uploadMulti = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // límite de tamaño de archivo
    }
}).any();


module.exports = {
    upload,
    uploadMulti
};
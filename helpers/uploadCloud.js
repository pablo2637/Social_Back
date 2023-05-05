const cloudinary = require('../configs/cloudinayConfig');

/** 
 * @author Pablo
 * @exports Object
 * @module uploadCloud
 */


/**
 * Sube una imagen a Cloudinary
 * @method uploadCloud
 * @async
 * @param {String} urlPic URL de la imagen a subir a Cloudinary
 * @param {String} publicID Nombre público que tendra la imagen
 * @param {String} newFolder Carpeta donde almacenar la imagen
 * @returns {String} URL de la imagen guardada en Cloudinary 
 * @throws {String} Mensaje de error por consola
 */
const uploadCloud = async (urlPic, publicID, newFolder) => {

    let res;
    try {
        // console.log('urlPic', urlPic, 'publicID', publicID, 'newFolder', newFolder)
        res = await cloudinary.uploader.upload(urlPic, { folder: newFolder, public_id: publicID })

    } catch (error) {
        console.log('error upload', error);
    }

    // const url = cloudinary.url(publicID, {
    //     width: 100,
    //     height: 150,
    //     Crop: 'fill'
    // });

    return res.secure_url;
    // https://res.cloudinary.com/<cloud_name>/image/upload/h_150,w_100/6446cbd3558cc9e8f864b5b9
    // https://res.cloudinary.com/dxjemtm7s/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1682361300/6446cbd3558cc9e8f864b5b9.jpg

}

module.exports = { uploadCloud }
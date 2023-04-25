const cloudinary = require('../configs/cloudinayConfig');

const uploadPic = (urlPic, publicID) => {

    // const res = cloudinary.uploader.upload('https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg', { public_id: "olympic_flag" })
    const res = cloudinary.uploader.upload(urlPic, { folder: 'Social', public_id: publicID })

    res.then((data) => {
        console.log(data);
        console.log(data.secure_url);
    }).catch((err) => {
        console.log('error upload', err);
    });


    // Generate 
    const url = cloudinary.url(publicID, {
        width: 100,
        height: 150,
        Crop: 'fill'
    });



    // The output url
    console.log(url);
    // https://res.cloudinary.com/<cloud_name>/image/upload/h_150,w_100/6446cbd3558cc9e8f864b5b9
    // https://res.cloudinary.com/dxjemtm7s/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1682361300/6446cbd3558cc9e8f864b5b9.jpg

}

module.exports = { uploadPic }
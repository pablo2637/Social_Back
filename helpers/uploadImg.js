const multer = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/');
    },
    filename: function (req, file, cb) {
        console.log('filename', file.originalname)
        const extension = file.originalname.split('.');
        const uniqueSuffix = `${Date.now()}.${extension[extension.length - 1]}`;

        cb(null, uniqueSuffix);
    }
});


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // límite de tamaño de archivo
    }
}).single('image');


module.exports = { upload };
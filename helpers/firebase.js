const admin = require('firebase-admin');
const fb = require('../configs/firebaseAdmin');

// const config = {
//     credential: admin.credential.cert('fireBaseAdmin.json')
// }

const config = {
    credential: admin.credential.cert(fb)
}

const FirebaseApp = admin.initializeApp(config);

module.exports = { FirebaseApp }

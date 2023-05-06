const admin = require('firebase-admin');

const config = {
    credential: admin.credential.cert('fireBaseAdmin.json')
}

const FirebaseApp = admin.initializeApp(config);

module.exports = { FirebaseApp }

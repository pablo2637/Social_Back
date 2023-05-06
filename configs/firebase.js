const admin = require('firebase-admin');

const config = {
    credential: admin.credential.cert('fireBaseAdmin.json')
}

// const fb = {
//     "type": process.env.FB_TYPE,
//     "project_id": process.env.FB_PROJECT_ID,
//     "private_key_id": process.env.FB_PRIVATE_ID,
//     "private_key": process.env.FB_PRIVATE_KEY,
//     "client_email": process.env.CLIENT_EMAIL,
//     "client_id": process.env.CLIENT_ID,
//     "auth_uri": process.env.AUTH_URI,
//     "token_uri": process.env.TOKEN_URI,
//     "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_CERT_URL,
//     "client_x509_cert_url": process.env.CLIENT_CERT_URL
// }

// const config = {
//     credential: admin.credential.cert(fb)
// }

const FirebaseApp = admin.initializeApp(config);

module.exports = { FirebaseApp }

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const connect = async () => {
    try {
        const response = await mongoose.connect(process.env.URI_CONNECT);
        console.log('Connected to the database...');
        return response;
    } catch (error) {
        return {
            ok: false,
            msg: 'Connecion failure.',
            error
        }
    }
}

module.exports = { connect }
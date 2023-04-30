const User = require('../models/usersModel');


const getProfiles = async (req, res) => {

    try {

        const profiles = await User.find({}, { name: 1, email: 1, profile: 1, profileOrder: 1 });

        if (profiles.length == 0)
            return res.status(400).json({
                ok: false,
                msg: 'No hay perfiles en la bbdd.'
            });


        return res.status(200).json({
            ok: true,
            msg: 'Perfiles encontrados con éxito',
            data: profiles
        });

    } catch (e) {
        console.log('getProfiles error:', e);

        return res.status(404).json({
            ok: false,
            msg: 'Error getProfiles: fallo al intentar recuperar todos los perfiles',
            error: e
        });

    };
};



module.exports = {
    getProfiles
}
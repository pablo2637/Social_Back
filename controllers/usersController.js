const User = require('../models/usersModel');
const bcrypt = require('bcryptjs');
const { uploadCloud } = require('../helpers/uploadCloud');
const fs = require('fs').promises;


const msgPass = 'Oculto por seguridad...';


const getUsers = async (req, res) => {

    try {

        const users = await User.find();

        if (users.length == 0)
            return res.status(400).json({
                ok: false,
                msg: 'No hay usuarios en la bbdd.'
            });

        users.map(user => user.password = msgPass);

        return res.status(200).json({
            ok: true,
            msg: 'Usuarios encontrados con éxito',
            data: users
        });

    } catch (e) {
        console.log('getUsers error:', e);

        return res.status(404).json({
            ok: false,
            msg: 'Error getUsers: fallo al intentar recuperar todos los usuarios',
            error: e
        });

    };
};



const getUserByEmail = async ({ params }, res) => {

    try {

        const user = await User.findOne({ "email": params.email });

        if (!user)
            return res.status(403).json({
                ok: false,
                msg: `El email ${params.email} no esta registrado en la bbdd.`,
            });

        return res.status(200).json({
            ok: true,
            msg: 'Usuario encontrado con éxito',
            data: {
                uid: user.uid,
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                friends: user.friends,
                profile: user.profile,
                theme: user.theme,
                isAdmin: user.isAdmin,
                date: user.date
            }
        });

    } catch (e) {
        console.log('getUserByEmail error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'getUserByEmail: fallo al intentar buscar el usuario.',
            error: e
        });

    };
};



const createUser = async (req, res) => {

    try {

        const body = new Object(req.body);

        const yaExiste = await User.findOne({ "email": body.email });

        if (yaExiste)
            return res.status(403).json({
                ok: false,
                msg: `createUser: no es posible crear el usuario. El email ${body.email} ya esta en uso.`,
            });


        let urlPic;
        if (req.file)
            urlPic = await uploadCloud(`./public/${req.file.filename}`, body.uid);

        else
            urlPic = await uploadCloud(body.image, body.uid);



        body.image = urlPic;
        const user = new User(body);
        const salt = bcrypt.genSaltSync(10);

        user.password = bcrypt.hashSync(body.password, salt);


        await user.save();

        if (req.file)
            await fs.unlink(`./public/${req.file.filename}`);


        return res.status(201).json({
            ok: true,
            msg: 'Usuario creado con éxito',
            data: {
                uid: user.uid,
                id: user.id,
                name: user.name,
                image: user.image,
                email: user.email
            }
        });

    } catch (e) {
        console.log('createUser error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'createUser: Ha habido un fallo al crear el usuario.',
            error: e
        });

    };
};




const updateUser = async ({ body }, res) => {

    try {

        let { id, name, lastName, password, imagen } = body;

        const salt = bcrypt.genSaltSync(10);
        password = bcrypt.hashSync(password, salt);


        const user = await User.findByIdAndUpdate(id,
            { name, password, imagen }, { new: true });

        if (!user)
            return res.status(400).json({
                ok: false,
                msg: `No existe ningún usuario con el ObjectId(${id})`
            });

        return res.status(201).json({
            ok: true,
            msg: 'Usuario actualizado con éxito',
            data: {
                uid: user.uid,
                id: user.id,
                name: user.name,
                image: user.image,
                email: user.email
            }
        });

    } catch (e) {
        console.log('updateUser error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'updateUser: Ha habido un fallo al modificar el usuario.',
            error: e
        });

    };
};



const updateUsersFriends = async ({ body }, res) => {

    try {

        const { id, friends } = body;


        const user = await User.findByIdAndUpdate(id,
            { friends }, { new: true });

        if (!user)
            return res.status(400).json({
                ok: false,
                msg: `No existe ningún usuario con el ObjectId(${id})`
            });

        return res.status(201).json({
            ok: true,
            msg: 'Usuario actualizado con éxito',
            data: {
                uid: user.uid,
                id: user.id,
                name: user.name,
                image: user.image,
                email: user.email,
                friends: user.friends
            }
        });

    } catch (e) {
        console.log('updateUsersFriends error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'updateUsersFriends: Ha habido un fallo al modificar el usuario.',
            error: e
        });

    };
};



const deleteUser = async ({ body }, res) => {

    try {

        const user = await User.findByIdAndDelete(body.id);

        if (!user)
            return res.status(400).json({
                ok: false,
                msg: `No existe ningún usuario con el ObjectId(${body.id})`
            });

        return res.status(201).json({
            ok: true,
            msg: 'Usuario eliminado con éxito'
        });

    } catch (e) {
        console.log('deleteUser error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'deleteUser: Ha habido un fallo al eliminar el usuario.',
            error: e
        });

    };
};



const loginUser = async ({ body }, res) => {

    try {

        const user = await User.findOne({ "email": body.email });

        if (!user)
            return res.status(403).json({
                ok: false,
                msg: `El email ${body.email} no esta registrado en la bbdd.`,
            });

        const passwordOk = bcrypt.compareSync(body.password, user.password);

        if (!passwordOk)
            return res.status(401).json({
                ok: false,
                msg: 'El usuario/contraseña no corresponden a los datos almacenados.',
            });

        user.password = msgPass;

        return res.status(200).json({
            ok: true,
            msg: 'Login correcto.',
            data: user
        });

    } catch (e) {
        console.log('loginUser error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'loginUser: fallo al intentar loguear al usuario.',
            error: e
        });

    };
};


module.exports = {
    getUsers,
    getUserByEmail,
    updateUsersFriends,
    loginUser,
    updateUser,
    deleteUser,
    createUser
}
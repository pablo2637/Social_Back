const User = require('../models/usersModel');
const Invite = require('../models/invitesModel');
const bcrypt = require('bcryptjs');
const { uploadCloud } = require('../helpers/uploadCloud');
const fs = require('fs').promises;

const msgPass = 'Oculto por seguridad...';


const deleteInvite = async ({ body }, res) => {

    try {
        console.log('body', body)
        const invite = await Invite.findByIdAndDelete(body._id);
        console.log('invite',invite)
        if (!invite)
            return res.status(400).json({
                ok: false,
                msg: `No existe ninguna invitación con el ObjectId(${body._id})`
            });

        return res.status(201).json({
            ok: true,
            msg: 'Invitación eliminada con éxito.'
        });

    } catch (e) {
        console.log('deleteInvite error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'deleteInvite: Ha habido un fallo al eliminar la invitación.',
            error: e
        });

    };
};



const getInvites = async (req, res) => {

    try {

        const invites = await Invite.find({ response: false });

        if (invites.length == 0)
            return res.status(400).json({
                ok: false,
                msg: 'No hay invitaciones en la bbdd.'
            });

        return res.status(200).json({
            ok: true,
            msg: 'Invitaciones recuperadas con éxito',
            data: invites
        });

    } catch (e) {
        console.log('getInvites error:', e);

        return res.status(404).json({
            ok: false,
            msg: 'Error getInvites: fallo al intentar recuperar todos las invitaciones',
            error: e
        });

    };
};



const createInvite = async ({ body }, res) => {

    try {

        const { sender, receiver } = body;

        const yaExiste = await Invite.findOne({
            "sender": sender,
            "receiver": receiver,
            "response": false
        });

        if (yaExiste)
            return res.status(400).json({
                ok: false,
                msg: `No es posible enviar la invitación, porque ya hay una pendiente de respuesta`,
            });


        const invite = new Invite({ sender, receiver });

        await invite.save();

        return res.status(201).json({
            ok: true,
            msg: 'Invitación creada con éxito',
            invite
        });

    } catch (e) {
        console.log('incomingInvite error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'incomingInvite: Ha habido un fallo al crear la invitación.',
            error: e
        });

    };
}


const respondInvite = async ({ body }, res) => {

    try {

        const response = true;
        const { accept, _id, sender, receiver } = body;

        const invite = await Invite.findByIdAndUpdate(_id,
            { response, accept }, { new: true });

        if (!invite)
            return res.status(400).json({
                ok: false,
                msg: `No existe ninguna invitación con el ObjectId(${id})`
            });

        const friend1 = await User.findByIdAndUpdate(sender,
            { $push: { friends: receiver } }, { new: true });

        const friend2 = await User.findByIdAndUpdate(receiver,
            { $push: { friends: sender } }, { new: true });

        if (!friend1 || !friend2)
            return res.status(400).json({
                ok: false,
                msg: `Error al agregar el amigo`
            });


        return res.status(200).json({
            ok: true,
            msg: 'Invitación actualizada con éxito',
            invite
        });

    } catch (e) {
        console.log('respondInvite error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'respondInvite: Ha habido un fallo al responder a la invitación.',
            error: e
        });

    };
}



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


        user.password = msgPass;
        return res.status(200).json({
            ok: true,
            msg: 'Usuario encontrado con éxito',
            user
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
            urlPic = await uploadCloud(`./public/${req.file.filename}`, body.uid, 'Social');

        else
            urlPic = await uploadCloud(body.image, body.uid, 'Social');


        body.image = urlPic;
        const user = new User(body);
        const salt = bcrypt.genSaltSync(10);

        user.password = bcrypt.hashSync(body.password, salt);


        await user.save();

        if (req.file)
            await fs.unlink(`./public/${req.file.filename}`);


        user.password = msgPass;
        return res.status(201).json({
            ok: true,
            msg: 'Usuario creado con éxito',
            user
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




const updateUser = async (req, res) => {

    try {

        const body = new Object(req.body);

        let { _id, uid, name, image, imageURL } = body;

        let urlPic;
        if (req.file)
            urlPic = await uploadCloud(`./public/${req.file.filename}`, uid, 'Social');

        else
            urlPic = await uploadCloud(imageURL, body.uid, 'Social');


        image = urlPic;
        const user = await User.findByIdAndUpdate(_id,
            { name, image }, { new: true });

        if (!user)
            return res.status(400).json({
                ok: false,
                msg: `No existe ningún usuario con el ObjectId(${id})`
            });


        if (req.file)
            await fs.unlink(`./public/${req.file.filename}`);


        user.password = msgPass;
        return res.status(200).json({
            ok: true,
            msg: 'Usuario actualizado con éxito',
            user
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

        user.password = msgPass;
        return res.status(201).json({
            ok: true,
            msg: 'Usuario actualizado con éxito',
            user
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



const orderArray = (arrayOriginal, arrayOrder) => {

    const newArray = [];

    arrayOrder.forEach(el => {
        console.log('el', el)
        newArray.push(arrayOriginal.find(elAO => elAO.id == el));
    });

    return newArray;
}



const updateUsersProfile = async (req, res) => {

    try {

        // console.log('req files', req.files)
        // console.log('req body', req.body)
        const body = new Object(req.body);
        const { _id, uid, profileOrder, ...profile } = body;

        let newProfile = [];
        const newProfileOrder = profileOrder.split(',');

        console.log('profile', profile)
        for (const key in profile) {
            const tempKey = key.split('-');
            newProfile.push({
                content: profile[key],
                typeInput: tempKey[0],
                id: key,
                name: key
            });
        }


        let urlPic;
        const arrayFiles = req.file || req.files;

        if (arrayFiles)
            for (let i = 0; i < arrayFiles.length; i++) {
                urlPic = await uploadCloud(`./public/${arrayFiles[i].filename}`, i + body.uid, `Social/${body.uid}`);
                newProfile.push({
                    content: urlPic,
                    typeInput: 'image',
                    id: arrayFiles[i].fieldname,
                    name: arrayFiles[i].fieldname
                });
            };


        // console.log('newProfile before', newProfile);
        newProfile = orderArray(newProfile, newProfileOrder);
        // console.log('newProfile after', newProfile);


        const update = { $set: { profile: newProfile, profileOrder: newProfileOrder } };
        const response = await User.updateOne({ _id }, update, { new: true });

        if (!response)
            return res.status(400).json({
                ok: false,
                msg: `No existe ningún usuario con el ObjectId(${id})`
            });


        const user = await User.findById(_id);

        if (arrayFiles) {
            for (let i = 0; i < arrayFiles.length; i++) {
                await fs.unlink(`./public/${arrayFiles[i].filename}`);
            }
        }

        user.password = msgPass;
        return res.status(201).json({
            ok: true,
            msg: 'Usuario actualizado con éxito',
            user
        });

    } catch (e) {
        console.log('updateUsersProfile error:', e);

        return res.status(500).json({
            ok: false,
            msg: 'updateUsersProfile: Ha habido un fallo al modificar el usuario.',
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
            user
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
    createInvite,
    respondInvite,
    deleteInvite,
    getInvites,
    getUsers,
    getUserByEmail,
    updateUsersFriends,
    loginUser,
    updateUsersProfile,
    updateUser,
    deleteUser,
    createUser
}
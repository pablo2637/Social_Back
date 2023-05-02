const express = require('express');
const router = express.Router();

const { check } = require('express-validator');
const { validateInputs } = require('../middlewares/validateInputs');

const { upload, uploadMulti } = require('../helpers/uploadImg')

const {
    createInvite, respondInvite, getInvites, deleteInvite,

    createUser, updateUser, deleteUser,

    getUsers, getUserByEmail,

    loginUser,
    updateUsersFriends,
    updateUsersProfile
} = require('../controllers/usersController');



router.get('/', getUsers);


router.get('/email/:email', getUserByEmail);


router.put('/profile', [
    uploadMulti
], updateUsersProfile);


router.post('/invite', createInvite);

router.put('/invite', respondInvite);

router.delete('/invite', deleteInvite);

router.get('/invite', getInvites);


router.post('/', [
    // check('name', 'El nombre es obligatorio.').trim().notEmpty(),    
    // check('email', 'El email es obligatorio, por favor, verifícalo.').trim().isEmail(),
    // check('image', 'La imagen es obligatoria.').trim().notEmpty(),
    // validateInputs,    
    upload
], createUser);


router.put('/', [
    // check('name', 'El nombre es obligatorio.').trim().notEmpty(),
    // check('image', 'La imagen es obligatoria.').trim().notEmpty(),
    // validateInputs
    upload
], updateUser);


router.delete('/', deleteUser);


router.post('/login', [
    check('email', 'El email es obligatorio, por favor, verifícalo.').trim().isEmail(),
    validateInputs
], loginUser);


module.exports = router
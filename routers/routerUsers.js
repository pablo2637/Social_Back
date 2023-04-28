const express = require('express');
const router = express.Router();

const { check } = require('express-validator');
const { validateInputs } = require('../middlewares/validateInputs');

const { upload } = require('../helpers/uploadImg')

const {
    createUser,
    getUsers,
    getUserByEmail,
    updateUser,
    deleteUser,
    loginUser,
    updateUsersFriends
} = require('../controllers/usersController');



router.get('/', getUsers);


router.get('/email/:email', getUserByEmail);


router.post('/', [
    // check('name', 'El nombre es obligatorio.').trim().notEmpty(),
    // check('password', 'La contraseña es obligatoria y debe tener entre 5 y 10 caracteres.').trim().isLength({ min: 5, max: 10 }).notEmpty(),
    // check('email', 'El email es obligatorio, por favor, verifícalo.').trim().isEmail(),
    // check('image', 'La imagen es obligatoria.').trim().notEmpty(),
    // validateInputs,    
    upload
], createUser);


router.put('/', [
    // check('name', 'El nombre es obligatorio.').trim().notEmpty(),
    // check('password', 'La contraseña es obligatoria y debe tener entre 5 y 10 caracteres.').trim().isLength({ min: 5, max: 10 }).notEmpty(),
    // check('email', 'El email es obligatorio, por favor, verifícalo.').trim().isEmail(),
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
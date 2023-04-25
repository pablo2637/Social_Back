const express = require('express');
const router = express.Router();

const { check } = require('express-validator');
const { validateInputs } = require('../middlewares/validateInputs');

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


router.get('/email', getUserByEmail);


router.post('/', [
    check('name', 'El nombre es obligatorio.').trim().notEmpty(),
    check('lastName', 'El apellido es obligatorio.').trim().notEmpty(),
    check('password', 'La contraseña es obligatoria y debe tener entre 5 y 10 caracteres.').trim().isLength({ min: 5, max: 10 }).notEmpty(),
    check('email', 'El email es obligatorio, por favor, verifícalo.').trim().isEmail().normalizeEmail(),
    check('imagen', 'La imagen es obligatoria.').trim().notEmpty(),
    check('dateOfBirth', 'La fecha de nacimiento es obligatoria.').trim().isDate().notEmpty(),
    check('dateOfBirth', 'La fecha de nacimiento debe ser válida.').isAfter('1940/01/01'),
    validateInputs
], createUser);


router.put('/', [
    check('name', 'El nombre es obligatorio.').trim().notEmpty(),
    check('lastName', 'El apellido es obligatorio.').trim().notEmpty(),
    check('password', 'La contraseña es obligatoria y debe tener entre 5 y 10 caracteres.').trim().isLength({ min: 5, max: 10 }).notEmpty(),
    check('email', 'El email es obligatorio, por favor, verifícalo.').trim().isEmail().normalizeEmail(),
    check('imagen', 'La imagen es obligatoria.').trim().notEmpty(),
    check('dateOfBirth', 'La fecha de nacimiento es obligatoria.').trim().isDate().notEmpty(),
    check('dateOfBirth', 'La fecha de nacimiento debe ser válida.').isAfter('1940/01/01'),
    validateInputs
], updateUser);


router.delete('/', deleteUser);


router.post('/login', [
    check('email', 'El email es obligatorio, por favor, verifícalo.').trim().isEmail().normalizeEmail(),
    validateInputs
], loginUser);


module.exports = router
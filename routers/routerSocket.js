const express = require('express');
const router = express.Router();

const {
    execute,
    executeEP } = require('../controllers/socketController');

router.post('/', executeEP);

module.exports = router;

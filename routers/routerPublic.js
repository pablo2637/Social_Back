const express = require('express');
const router = express.Router();

const { getProfiles } = require('../controllers/publicController')

router.get('/', getProfiles);

module.exports = router;
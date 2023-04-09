const express = require('express');
const router = express.Router();

const {createChat} = require('../src/controllers/chatControllers')

router.post('/', createChat)

module.exports = router
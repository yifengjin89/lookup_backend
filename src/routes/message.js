const express = require('express');
const Message = require('../controllers/message');

const router = express.Router();

//SEND FRIEND / TUTOR REQUEST
router.post('/:id/sendRequest', Message.sendRequest);

//MESSAGE RESPONSE
router.post('/:id/response', Message.response);

module.exports = router;
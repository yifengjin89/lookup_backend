const express = require('express');
const Conversation = require('../controllers/conversation');

const router = express.Router();

router.post('/:id/loadConversation', Conversation.loadConversation);

router.post('/:id/sendMessage', Conversation.sendMessage);

module.exports = router;
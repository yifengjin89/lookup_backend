const express = require('express');
const Chat_Message = require('../controllers/chat_message');

const router = express.Router();

//LOAD CHAT MESSAGES
router.get('/chat_message/{conversationId}', Chat_Message.loadChatMessages);

// CREATE CHAT CONNVERSATIONS
router.post('/chat_message', Chat_Message.createChatMessage);

module.exports = router;

const express = require('express');
const Chat_Message = require('../controllers/conversation');

const router = express.Router();

//LOAD CHAT CONVERSATIONS
router.get('/conversations', Chat.loadConversations);

// CREATE CHAT CONNVERSATIONS
router.post('/conversations', Chat.createConversations);

module.exports = router;
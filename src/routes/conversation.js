const express = require('express');
const Conversation = require('../controllers/conversation');

const router = express.Router();

// load / create Conversation 
router.post('/:id/loadConversation', Conversation.loadConversation);

//  send message
router.post('/:id/sendMessage', Conversation.sendMessage);

// get conversation by conversation
router.get('/:id/getConversation', Conversation.getConversation);


module.exports = router;
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({

    userOneId: {
        type: String,
    },

    userTwoId: {
        type: String,
    },

    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat_Message',
    }],
});

module.exports = mongoose.model('Conversation', ConversationSchema);
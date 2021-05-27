const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({

    userOneId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    userTwoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    conversationHistory: [{
        _id: String,
        text: String,
        createdAt: String
    }],
});

module.exports = mongoose.model('Conversations', ConversationSchema);
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

    userOneHistory: [{

        text: String,
        createdAt: String
    }],

    userTwoHistory: [{

        text: String,
        createdAt: String
    }]

    


   /* userOneMessages: {
        type: String,
    },

    userTwoMessages: {
        type: String,
    },

   /* messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat_Message',
    }], */
});

module.exports = mongoose.model('Conversations', ConversationSchema);
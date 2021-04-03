const mongoose = require('mongoose');

const Chat_MessageSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    text: {
        type: String,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

});

module.exports = mongoose.model('Chat_Message', Chat_MessageSchema);
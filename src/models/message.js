const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    from_userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },

    to_userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }, 
    
    from_username: {
      type: String,
      ref: 'User',
    },

    from_profileImage: {
      type: String,
      ref: 'User',
    },

    msgType: {
      type: String,
    },

    status:{
        type: String,
        default: 'Pending',
    },

}, {timestamps: true});

module.exports = mongoose.model('Message', MessageSchema);
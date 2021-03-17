const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  send:[{
    receiverId:String,
    receiver:String,
    
  }],
  receive:[{

  }],

})

module.exports = mongoose.model('Messages', messageSchema);
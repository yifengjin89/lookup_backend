//const User = require('../models/user');
const Chat_Message = require('../models/chat_message');
const Conversation = require('../models/conversation');

exports.createChatMessage = (message) => {
    try {
        Conversation.findById(message.conversationId).then((conversation) => {
            const textMessage = new Chat_Message({
                text: message.text,
                userId: message.senderId,
            });
            textMessage.save().then((savedMessage) => {
                conversation.messages.push(savedMessage);
                conversation.save();
            });
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loadChatMessages = async function (req, res) {
    try {
        await Conversation.findById(req.params.conversationId).populate('messages').then(
            (conversation) => {
                if (conversation) {
                    res({ id: conversation._id, messages: conversation.messages });
                } /*else {
            reply(Boom.notFound('Cannot find conversations'));
          }*/
            },
        );
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}



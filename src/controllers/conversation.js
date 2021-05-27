const User = require('../models/user');
const Conversation = require('../models/conversation');

// @route post api/user/{id}/loadConversation
// @desc Check if a conversation with the two users already exist
// @access Public
exports.loadConversation = async function (req, res) {
    try {
        // from the user login perspective
        const from_userId = req.params.id;

        // the user they are trying to converse with
        const to_userId = req.body.to_userId;

        // check if exist conversation satuation 1: 'userOneId': from_userId, 'userTwoId': to_userId 
        let exist_conversation = await Conversation.findOne({ 'userOneId': from_userId, 'userTwoId': to_userId });

        if (exist_conversation) return res.status(200).json({ conversation: exist_conversation, message: 'conversation does exist' });
        
        // check if exist conversation satuation 2: 'userOneId': to_userId, 'userTwoId': from_userId 
        exist_conversation = await Conversation.find({ 'userOneId': to_userId, 'userTwoId': from_userId });

        if (exist_conversation) return res.status(200).json({ conversation: exist_conversation, message: 'conversation does exist' });

        // create new conversation
        const conversation = {
            userOneId: from_userId,
            userTwoId: to_userId,
        }

        const newConversation = await Conversation.create(conversation);

        // update user and friend info
        await User.findByIdAndUpdate(to_userId, {$push: {'conversations': reqConversation._id}}, {new: true});
        await User.findByIdAndUpdate(from_userId, {$push: {'conversations': reqConversation._id}}, {new: true});

        return res.status(200).json({ conversation: newConversation, message: 'Conversation Has been created!' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @route get api/user/{id}/getConversation
// @desc get a Conversation by conversationId
// @access Public
exports.getConversation = async function (req, res) {
    try {
        const conversationId = req.params.conversationId;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) return res.status(400).json({message: 'conversation does exist'});

        return res.status(200).json({ conversation: conversation });

    } catch (error) {
        res.status(500).json({ message: error.message });
    } 
}

// @route post api/user/{id}/sendMessage
// @desc send a message to friend
// @access Public
exports.sendMessage = async function (req, res) {
    try {
        const from_userId = req.params.id;
        const conversationId = req.body.conversationId;
        const text = req.body.text;

        // current timestamp
        date_now = Date();
        
        // create conversationHistory
        const conversationHistory = {
            _id: from_userId,
            text: text,
            createdAt: date_now
        }

        const convHist = await Conversation.findByIdAndUpdate(conversationId, { $push: { 'conversationHistory': conversationHistory }}, {new: true});

        return res.status(200).json({ conversation: convHist, message: 'message sent' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}




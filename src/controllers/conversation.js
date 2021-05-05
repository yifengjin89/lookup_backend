const User = require('../models/user');
const Conversation = require('../models/conversation');



// Check if a conversation with the two users already exist
exports.loadConversation = async function (req, res) {
    try {

        // from the user login perspective
        const from_userId = req.params.id;

        // the user they are trying to converse with
        const to_userId = req.body.to_userId;

        let exist_conversation = await Conversation.find({ 'userOneId': from_userId, 'userTwoId': to_userId });

        if (exist_conversation.length != 0) {

            return res.status(200).json({ exist_conversation, message: 'conversation does exist' });
        }

        if (exist_conversation.length == 0) {

            exist_conversation = await Conversation.find({ 'userOneId': to_userId, 'userTwoId': from_userId });

            if (exist_conversation.length != 0) {

                return res.status(200).json({ exist_conversation, message: 'conversation does exist' });
            }
        }

        // create new conversation

        const conversation = {
            userOneId: from_userId,
            userTwoId: to_userId,
        }

        const reqConversation = await Conversation.create(conversation);

        const update1 = await User.findByIdAndUpdate(to_userId, { $push: { 'conversations': reqConversation._id } });
        const update2 = await User.findByIdAndUpdate(from_userId, { $push: { 'conversations': reqConversation._id } });

        return res.status(200).json({ reqConversation, message: 'Conversation Has been created!' });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// send a message to friend
exports.sendMessage = async function (req, res) {

    try {

        const from_userId = req.params.id;

        const conversationId = req.body.conversationId;
        const text = req.body.text;

        let exist_conversation = await Conversation.find({ 'userOneId': from_userId });

        // current timestamp in milliseconds
        let ts = Date.now();

        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();

        // date & time in YYYY-MM-DD format
        date_now = year + "-" + month + "-" + date;

        const textMesgUserArr = {
            text: text,
            createdAt: date_now
        }

        const textMesgConvArr = {
            _id: from_userId,
            text: text,
            createdAt: date_now
        }

        if (exist_conversation != 0) {

            const userHist = await Conversation.findByIdAndUpdate(conversationId, { $push: { 'userOneHistory': textMesgUserArr } });
            const convHist = await Conversation.findByIdAndUpdate(conversationId, { $push: { 'conversationHistory': textMesgConvArr } });
            return res.status(200).json({ convHist, message: 'message sent' });

        }

        else {
            const userHist = await Conversation.findByIdAndUpdate(conversationId, { $push: { 'userTwoHistory': textMesgUserArr } });
            const convHist = await Conversation.findByIdAndUpdate(conversationId, { $push: { 'conversationHistory': textMesgConvArr } });
            return res.status(200).json({ convHist, message: 'message sent' });
        }

    }

    catch (error) {
        res.status(500).json({ message: error.message });
    }

}



